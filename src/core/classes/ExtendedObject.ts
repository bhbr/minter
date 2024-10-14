
// Problem: When updating a Mobject with setAttributes(args),
// some attributes should only be copied (passed by value),
// not linked (passed by reference). This mainly concerns Vertex.
// E. g. if one Mobject's anchor is set to another's by reference,
// these two attributes now point to the same object. Changing one
// Mobject's anchor now changes the other's as well.
// The issue stems from the fact that a Vertex is an object
// even though it should just be a "dumb" list of numbers (a struct)
// without a persistent identity.

// Solution: An ExtendedObject has a flag passedByValue, which
// is taken into account when updating a Mobject's attribute with
// such an ExtendedObject as argument.

import { Defaults } from './Defaults'
import { remove } from 'core/functions/arrays'
import { copy } from 'core/functions/copying'

export class ExtendedObject {

	defaultsDict: object
	passedByValue: boolean
	initComplete: boolean
	uninitializedProperties: Array<string>

	defaults(): object {
		return {
			immutable: {
				passedByValue: false
			}
		}
	}

	constructor(args: object = {}) {
		this.initComplete = false
		// if (this.constructor.name == 'Transform') {
		// 	console.log(this.propertyDescriptors())
		// 	console.log('properties:', this.properties())
		// 	console.log('setters:', this.setters())
		// 	console.log('initializable:', this.initializableProperties())
		// }
		this.uninitializedProperties = this.initializableProperties()
		this.defaultsDict = this.defaults()
		let defs = this.defaultValues()
		let inits = Object.assign(defs, args)
		let syncedInits = this.synchronizeUpdateArguments(inits)
		this.initializeProperties(syncedInits)
		this.checkForUndefinedValues()
		this.initComplete = true
	}

	initializeProperties(defaultValues: object) {
		for (let [prop, value] of Object.entries(defaultValues)) {
			// check for existing accessor (getter/setter)
			let setter = this.setter(prop)
			if (setter !== undefined) { 
				setter.call(this, value)
			} else {
				Object.defineProperty(this, prop, {
					value: value,
					writable: this.isMutable(prop)
				})
			}
			remove(this.uninitializedProperties, prop)
		}
	}

	initializableProperties(): Array<string> {
		let arr = this.properties()
		for (let prop of this.setters()) {
			remove(arr, prop)
		}
		return arr
	}

	mutability(prop: string): string | null {
		if (Object.keys(this.defaultsDict['readonly']).includes(prop)) {
			return 'readonly'
		}
		if (Object.keys(this.defaultsDict['immutable']).includes(prop)) {
			return 'immutable'
		}
		if (Object.keys(this.defaultsDict['mutable']).includes(prop)) {
			return 'mutable'
		}
		return null
	}

	isReadonly(prop: string): boolean {
		return this.mutability(prop) == 'readonly'
	}

	isImmutable(prop: string): boolean {
		return this.mutability(prop) == 'immutable'
	}

	isMutable(prop: string): boolean {
		return this.mutability(prop) == 'mutable'
	}

	defaultValue(prop: string): any {
		let def = this.defaultsDict ?? this.defaults()
		let mut = this.mutability(prop)
		let dec = def[mut]
		return dec[prop]
	}

	defaultValues(): object {
		let dict = {}
		let props = this.properties()
		for (let prop of props) {
			dict[prop] = this.defaultValue(prop)
		}
		return dict
	}

	properties(): Array<string> {
		let array: Array<string> = []
		let defs = this.defaultsDict ?? this.defaults()
		array = array.concat(Object.keys(defs['readonly'] ?? {}))
		array = array.concat(Object.keys(defs['immutable'] ?? {}))
		array = array.concat(Object.keys(defs['mutable'] ?? {}))
		return array
	}

	isCompatibleUpdate(args: object, className: string): boolean {
		var flag: boolean = true
		for (let [prop, value] of Object.entries(args)) {
			if (this.mutability(prop) === 'readonly'
				&& this.initComplete) {
				console.error(`Readonly property ${prop} cannot be set in object of class ${className}`)
				flag = false
			}
			if (this.mutability(prop) === 'immutable'
				&& this.initComplete) {
				console.error(`Immutable property ${prop} cannot be changed in object of class ${className}`)
				flag = false
			}
		}
		return flag
	}

	updateDefaults(oldDefaults: object, newDefaults: object): object {
		return Defaults.update(oldDefaults, newDefaults, this.constructor.name)
	}

	isGetter(prop: string): boolean {
		return this.propertyDescriptor(prop)['get'] !== undefined
	}

	isSetter(prop: string): boolean {
		let pd = this.propertyDescriptor(prop)
		if (pd === undefined) { return false }
		let s = pd['set']
		return s !== undefined
	}

	propertyDescriptors(): object {
		let pds = {}
		var obj = this
		while (obj) {
			pds = Object.assign(pds, Object.getOwnPropertyDescriptors(obj))
			obj = Object.getPrototypeOf(obj)
		}
		let myPds = {}
		for (let prop of this.properties()) {
			myPds[prop] = pds[prop]
		}
		return myPds
	}

	propertyDescriptor(prop: string): PropertyDescriptor | undefined {
		let pds = this.propertyDescriptors()
		return pds[prop]
	}


	getters(): Array<string> {
		let ret: Array<string> = []
		for (let prop of this.properties()) {
			if (this.isGetter(prop)) {
				ret.push(prop)
			}
		}
		return ret
	}

	setters(): Array<string> {
		let ret: Array<string> = []
		for (let prop of this.properties()) {
			if (this.isSetter(prop)) {
				ret.push(prop)
			}
		}
		return ret
	}

	getter(prop: string): any {
		let pd = this.propertyDescriptor(prop)
		return (pd === undefined) ? undefined : pd.get
	}

	setter(prop: string): any {
		let pd = this.propertyDescriptor(prop)
		return (pd === undefined) ? undefined : pd.set
	}

	synchronizeUpdateArguments(args: object = {}) {
		return args
	}

	update(args: object) {
		if (!this.isCompatibleUpdate(args, this.constructor.name)) { return }
		let accessorArgs: object = {}
		let otherPropertyArgs: object = {}

		for (let [prop, value] of Object.entries(args)) {
			if (!this.isSetter(prop)) {
	 			otherPropertyArgs[prop] = value
	 		} else {
	 			accessorArgs[prop] = value
	 		}
		}

		for (let [prop, value] of Object.entries(otherPropertyArgs)) {
			this.setValue(prop, value)

		}
		for (let [prop, value] of Object.entries(accessorArgs)) {
			this.setValue(prop, value)
		}
	}

	checkForUndefinedValues() {
		for (let prop of this.properties()) {
			if (this[prop] === undefined) {
				console.error(`Property ${prop} remains undefined in object of class ${this.constructor.name}`)
			}
		}
		if (this.uninitializedProperties.length != 0) {
			console.error(`Remaining uninitialized properties in object of class ${this.constructor.name}: ${this.uninitializedProperties}`)
		}
	}

	setValue(prop: string, value: any) {
		let setter: any = this.setter(prop)
			
		if (setter != undefined) {
			setter.call(this, value)
		} else {
			// we have an as-of-yet unknown property
			if (value instanceof ExtendedObject && value.passedByValue) {
				// create and copy (pass-by-value)
				if (this[prop] == undefined) {
					this[prop] = copy(value)
				} else {
					this[prop].copyFrom(value)
				}
			} else {
				// just link (pass-by-reference)
				// or pass-by-value a non-object
				try {
					this[prop] = value
				} catch {
					console.error(`Could not assign value ${value} to ${this.mutability(prop)} property ${prop} on ${this.constructor.name}`)
				}
			}
		}
		remove(this.uninitializedProperties, prop)
	}

	copyFrom(obj: ExtendedObject) {
		let args: object = {}
		for (let prop of obj.properties()) {
			if (obj.isReadonly(prop)) { continue }
			args[prop] = obj[prop]
		}
		this.update(args)
	}


}



























