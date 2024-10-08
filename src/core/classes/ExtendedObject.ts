
// Problem: When updating a Mobject with setAttributes(args),
// some attributes should only be copied (passed by value),
// not linked (passed by reference). This mainly concerns Vertex.
// E. g. if one Mobject's anchor is set to another's by reference,
//these two attributes now point to the same object. Changing one
// Mobject's anchor now changes the other's as well.
// The issue stems from the fact that a Vertex is an object
// even though it should just be a "dumb" list of numbers (a struct)
// without a persistent identity.

// Solution: An ExtendedObject has a flag passedByValue, which
// is taken into account when updating a Mobject's attribute with
// such an ExtendedObject as argument.

import { Mutability, DefaultsDict } from './DefaultsDict'

export class ExtendedObject {

	passedByValue: boolean
	private fullyInitialized: boolean

	constructor(props: object = {}) {

		this.fullyInitialized = false
		let def = this.defaults()

		let initialArgs = def.subclass(props)
		this.setProperties(initialArgs.readonly)
		this.setProperties(initialArgs.immutable)
		this.setProperties(initialArgs.mutable)
		let prop = this.properties()
		for (let key of prop) {
			if (this[key] === undefined) {
				console.warn(`Undefined properties in ${this}`)
			}
		}
		this.fullyInitialized = true
	}

	properties(): Array<string> {
		// get a list of all of the objects property names, from most specific to most abstract
		let obj: object = this
		let properties: Array<string> = []
		// this loop walks up the superclass hierarchy and collects all inherited properties
		while (obj.constructor.name != 'Object') {
			properties.push(...Object.getOwnPropertyNames(obj))
			obj = Object.getPrototypeOf(obj)
		}
		return properties
	}

	setter(key: string): any {
		// when updating a Mobject with mob.setAttributes({key: value}),
		// "key can refer to either:
		//  - a property (mob["key"]) or
		//  - an accessor (getter/setter mob.key)
		// this picks the right one to call in setAttributes
		// so we don't create properties that shouldn't be objects in their own right
		let descriptor: any = undefined
		if (this.properties().includes(key)) {
			let obj: object = this
			while (obj.constructor.name != 'Object' && descriptor == undefined) {
				descriptor = Object.getOwnPropertyDescriptor(obj, key)
				obj = Object.getPrototypeOf(obj)
			}
		}
		if (descriptor != undefined) { return descriptor.set }
		else { return undefined }
	}

	isReadonly(prop: string): boolean { return this.defaults().isReadonly(prop) }
	isImmutable(prop: string): boolean { return this.defaults().isImmutable(prop) }
	isMutable(prop: string): boolean { return this.defaults().isMutable(prop) }

	setProperties(args: object = {}) {
		// update the object with the given property names and values
		// always change an object via this method,
		// it will automatically check for mutability
		// and pick the right setter method


		let accessorArgs: object = {}
		let otherPropertyArgs: object = {}

		for (let [key, value] of Object.entries(args)) {

			if (this.isReadonly(key) && this[key] !== undefined) {
				console.warn(`Readonly property ${key} cannot be set to value ${value}`)
				continue
			}

			if (this.isImmutable(key) && this[key] !== undefined) {
				console.warn(`Immutable property ${key} cannot be set to value ${value}`)
				continue
			}

			if (Object.getPrototypeOf(this).__lookupGetter__(key) === undefined) {
				otherPropertyArgs[key] = value
			} else {
				accessorArgs[key] = value
			}

		}

		for (let [key, value] of Object.entries(accessorArgs)) {
			this.setValue(key, value)
		}
		for (let [key, value] of Object.entries(otherPropertyArgs)) {
			this.setValue(key, value)
		}

		// let accessorArgs: object = {}
		// let otherPropertyArgs: object = {}

		// for (let [key, dict] of Object.entries(args)) {

		// 	if (dict.mutable === 'never' || (dict.mutable == 'once' && this[key] !== undefined)) {
		// 		console.error(`Cannot reassign property ${key} (to ${dict.value.toString()}) on ${this.constructor.name}`)
		// 		continue
		// 	}

		// 	if (Object.getPrototypeOf(this).__lookupGetter__(key) === undefined) {
		// 		otherPropertyArgs[key] = dict.value
		// 	} else {
		// 		accessorArgs[key] = dict.value
		// 	}
		// }

		// for (let [key, value] of Object.entries(accessorArgs)) {
		// 	this.setValue(key, value)
		// }
		// for (let [key, value] of Object.entries(otherPropertyArgs)) {
		// 	this.setValue(key, value)
		// }
	}

	setValue(key: string, value: any) {
		let setter: any = this.setter(key)
			
		if (setter != undefined) {
			
			// if (this.isImmutable(key) && this[key] !== undefined) {
			// 	console.warn(`Cannot reassign property ${key} (to ${value.toString()}) on ${this.constructor.name}`)
			// 	return
			// }
			setter.call(this, value)
			
		} else {
			// we have an as-of-yet unknown property
			if (value != undefined && value.passedByValue) {
				// create and copy (pass-by-value)
				if (this[key] == undefined) {
					this[key] = new value.constructor()
				}
				this[key].copyFrom(value) 
			} else {
				// just link (pass-by-reference)
				this[key] = value
			}
		}
	}

	copyPropertiesFrom(obj: ExtendedObject, props: Array<string>) {
		let updateDict: object = {}
		for (let prop of props) {
			updateDict[prop] = obj[prop]
		}
		this.setProperties(updateDict)
	}

	readonlyProperties(): Array<string> { return [] }

	setDefaults(argsDict: object = {}) {
	// we often cannot set default values for properties as declarations alone
	// (before and outside the methods) as these get set too late
	// (at the end of the constructor)
	// instead we call setDefaults at the appropriate time earlier in the constructor

	// the argsDict is considered as soft suggestions, only for properties
	// that have not yet been set
	// this is in opposition to setAttributes which has the mandate
	// to overwrite existing properties
		let undefinedKVPairs: object = {}
		for (let [key, value] of Object.entries(argsDict)) {
			if (this[key] == undefined) { undefinedKVPairs[key] = value }
		}
		this.setProperties(undefinedKVPairs)
	}

	defaults(): DefaultsDict {
		return new DefaultsDict({
			immutable: {
				passedByValue: false
			}
		})
	}

	copy(): ExtendedObject {
		let obj = new ExtendedObject()
		obj.copyPropertiesFrom(this, Object.keys(this))
		return obj
	}

	toString(): string {
		return this.constructor.name
	}

}



























