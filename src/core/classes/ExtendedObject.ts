
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

import { remove } from 'core/functions/arrays'
import { copy, equalObjects } from 'core/functions/copying'


class BaseExtendedObject {

	ownDefaults(): object { return {} }
	ownMutabilities(): object { return {} }
	mutability(prop: string): string { return 'always' }
}

export class ExtendedObject extends BaseExtendedObject {

	_classHierarchy: Array<string>
	_mutabilities: object
	_hierarchicalMutabilities: object
	_hierarchicalDefaults: object
	_defaults: object
	_initComplete: boolean
	_checkPermissions: boolean
	static mutabilityOrder = {
		'always': 0,
		'on_init': 1,
		'in_subclass': 2,
		'never': 3
	}

	static compatibleMutabilities(oldMut, newMut): boolean {
		return (ExtendedObject.mutabilityOrder[newMut] >= ExtendedObject.mutabilityOrder[oldMut])
	}

	constructor(args: object = {}) {
	 	super()
		this._initComplete = false
		this._classHierarchy = []
		this._hierarchicalMutabilities = {}
		this._hierarchicalDefaults = {}
		var previousMutabilities = {}
		var previousDefaults = {}
		var obj = Object.getPrototypeOf(this)
		let prototypes: Array<ExtendedObject> = []
		while (obj.constructor.name != 'BaseExtendedObject') {
			prototypes.push(obj)
			this._classHierarchy.push(obj.constructor.name)
			obj = Object.getPrototypeOf(obj)
		}

		prototypes.reverse()
		this._classHierarchy.reverse()

		for (let obj of prototypes) {
			let newMutabilities = obj.ownMutabilities()
			if (!equalObjects(previousMutabilities, newMutabilities)) {
				this._hierarchicalMutabilities[obj.constructor.name] = newMutabilities
				previousMutabilities = newMutabilities
			} else {
				this._hierarchicalMutabilities[obj.constructor.name] = {}
			}
			let newDefaults = obj.ownDefaults()
			if (!equalObjects(previousDefaults, newDefaults)) {
				this._hierarchicalDefaults[obj.constructor.name] = newDefaults
				previousDefaults = newDefaults
			} else {
				this._hierarchicalDefaults[obj.constructor.name] = {}
			}
		}

		Object.defineProperty(this, '_mutabilities', {
			value: {},
			writable: false,
			enumerable: true
		})

		for (let cls of this._classHierarchy) {
			let mutDict = this._hierarchicalMutabilities[cls]
			for (let [prop, mut] of Object.entries(mutDict)) {
				if (Object.keys(this._mutabilities).includes(prop)) {
					let oldMut = this._mutabilities[prop]
					if (!ExtendedObject.compatibleMutabilities(oldMut, mut)) {
						throw `Incompatible mutabilites in class ${cls}`
					}
				}
				this._mutabilities[prop] = mut
			}
		}

		this._defaults = {}

		let previousMutabilities2 = {}
		for (let cls of this._classHierarchy) {
			let defDict = this._hierarchicalDefaults[cls]
			let mutDict = this._hierarchicalMutabilities[cls]
			for (let [prop, def] of Object.entries(defDict)) {
				if (previousMutabilities2[prop] === 'never') {
					throw `Trying to reassign immutable property ${prop} in class ${cls}`
				} else {
					this._defaults[prop] = def
				}
				if (previousMutabilities2[prop] === undefined) {
					previousMutabilities2[prop] = mutDict[prop] ?? 'always'
				}
			}
		}

		for (let cls of this._classHierarchy) {
			let mutDict = this._hierarchicalMutabilities[cls]
			for (let [prop, mut] of Object.entries(mutDict)) {
				this._mutabilities[prop] = mut
			}
		}

		for (let prop of Object.keys(this._defaults)) {
			if (!Object.keys(this._mutabilities).includes(prop)) {
				this._mutabilities[prop] = 'always'
			}
		}

		let inits = this.updateInits(this._defaults, args)
		this.setProperties(inits)
		Object.freeze(this._mutabilities)
		this._initComplete = true
	}

	ownMutabilities(): object {
		return {
			passedByValue: 'in_subclass'
		}
	}

	properties(): Array<string> {
		let ret: Array<string> = []
		for (let [cls, defDict] of Object.entries(this._hierarchicalDefaults)) {
			for (let prop of Object.keys(defDict)) {
				if (!ret.includes(prop)) {
					ret.push(prop)
				}
			}
		}
		return ret
	}
	
	mutability(prop: string): string {
		return this._mutabilities[prop] ?? 'always'
	}

	mutabilities(): object {
		let ret = {}
		for (let prop of this.properties()) {
			ret[prop] = this.mutability(prop)
		}
		return ret
	}

	ownDefaults(): object {
		return {
			passedByValue: false
		}
	}

	updateInits(oldInits: object, newInits: object): object {
		let updatedInits = copy(oldInits)
		for (let [prop, value] of Object.entries(newInits)) {
			let mutability = this._mutabilities[prop] ?? 'always'
			if ((mutability === 'never' || mutability == 'in_subclass') && Object.keys(updatedInits).includes(prop)) {
				// immutable property cannot be assigned a new default value
				throw `The property ${prop} on object ${this.constructor.name} cannot be assigned new initial value ${value}`
			}
			updatedInits[prop] = value
		}
	 	return updatedInits
	}

	checkPermissionsOnUpdateDict(args): boolean {
		for (let prop of Object.keys(args)) {
			let mutability = this._mutabilities[prop]
			if (mutability === 'never' || mutability === 'in_subclass') {
				throw `The property ${prop} on ${this.constructor.name} cannot be changed on initialization`
				return false
			} else if (mutability === 'on_init' && this._initComplete) {
				throw `The property ${prop} on ${this.constructor.name} cannot be changed after initialization`
				return false
			}
		}
		return true
	}

	synchronizeUpdateArguments(args: object): object {
		return args
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
		return pds
	}

	propertyDescriptor(prop: string): PropertyDescriptor | undefined {
		let pds = this.propertyDescriptors()
		return pds[prop]
	}

	setter(prop: string): any {
		let pd = this.propertyDescriptor(prop)
		return (pd === undefined) ? undefined : pd.set
	}

	update(args: object = {}) {
		let ok = Object.keys(args).every((prop) => this.mutability(prop) == 'always')
		if (ok) {
			args = this.removeUnchangedProperties(args)
			this.setProperties(args)
		} else {
			this.checkPermissionsOnUpdateDict(args)
		}
	}

	removeUnchangedProperties(args: object): object {
		for (let [prop, value] of Object.entries(args)) {
			if (this[prop] === undefined) { continue }
			if (typeof value != 'object' || value === null) {
				if (this[prop] === value) {
					delete args[prop]
				}
			} else if (value.constructor.name == 'Vertex' || value.constructor.name == 'Transform') {
				if (this[prop].equals(value)) {
					delete args[prop]
				}
			} else {
				if (this[prop] == value) {
					delete args[prop]
				}
			}
		}
		return args
	}

	setProperties(args: object = {}) {

	 	let syncedArgs = this.synchronizeUpdateArguments(args)

		let accessorArgs: object = {}
		let otherPropertyArgs: object = {}

		for (let [prop, value] of Object.entries(syncedArgs)) {
			if (!this.isSetter(prop)) {
	 			otherPropertyArgs[prop] = value
	 		} else {
	 			accessorArgs[prop] = value
	 		}
		}

		for (let [prop, value] of Object.entries(otherPropertyArgs)) {
			this.setProperty(prop, value)

		}
		for (let [prop, value] of Object.entries(accessorArgs)) {
			this.setProperty(prop, value)
	 	}
	}

	setProperty(prop: string, value: any) {
		let desc = this.propertyDescriptor(prop)
		if (desc === undefined) {
			Object.defineProperty(this, prop, {
				value: value,
				writable: (this.mutability(prop) === 'always'),
				enumerable: true
			})
		} else {
			let setter = this.setter(prop)
			if (setter !== undefined) {
				setter.call(this, value)
			} else {
				this[prop] = value
			}
		}
	}

	copyFrom(obj: ExtendedObject) {
		let argsDict: object = {}
		for (let prop of obj.properties()) {
			if (obj.mutability(prop) !== 'always') { continue }
			argsDict[prop] = obj[prop]
		}
		this.setProperties(argsDict)
	}

	// copyFrom(obj: ExtendedObject) {
	// 	let args: object = {}
	// 	for (let prop of obj.properties()) {
	// 		let mut = this.mutability(prop)
	// 		if (mut !== 'always') {
	// 			throw `Property ${prop} on ${this.constructor.name} cannot be copied from other object`
	// 			continue
	// 		}
	// 		args[prop] = obj[prop]
	// 	}
	// 	this.update(args)
	// }

	isMutable(prop: string) {
		return (this.mutability(prop) === 'always')
	}

}



























