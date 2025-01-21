
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
import { copy } from 'core/functions/copying'


class BaseExtendedObject {

	defaults(): object { return {} }
	mutabilities(): object { return {} }
	mutability(prop: string): string { return 'always' }
}

export class ExtendedObject extends BaseExtendedObject {

	_defaults: object
	_mutabilities: object
	_superclassMutabilities: object
	// passedByValue: boolean
	initComplete: boolean
	properties: Array<string>
	static mutabilityOrder = {
		'always': 0,
		'on_init': 1,
		'in_subclass': 2,
		'never': 3
	}


	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			passedByValue: false
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			passedByValue: 'in_subclass'
		})
	}

	constructor(args: object = {}) {
	 	super()
		this.initComplete = false
		this.properties = []
		this.setMutabilities()
		this.setDefaults()
		let ok = this.checkPermissions(args)
		if (!ok) { return }
		let inits = Object.assign(this._defaults, args)
		//inits = this.synchronizeUpdateArguments(inits)
		this.setProperties(inits)
		this.properties = Object.keys(inits)
	 	this.initComplete = true
	}

	updateMutabilities(oldMutabilities: object, newMutabilities: object): object {
		if (this._superclassMutabilities === undefined) {
		 	this._superclassMutabilities = {}
		}
		if (!this.areCompatibleMutabilities(oldMutabilities, newMutabilities)) {
			throw `Incompatible mutabilities`
		}
		Object.assign(this._superclassMutabilities, oldMutabilities)
		return Object.assign(oldMutabilities, newMutabilities)
	}

	areCompatibleMutabilities(oldMutabilities: object, newMutabilities: object): boolean {
		for (let [prop, newMut] of Object.entries(newMutabilities)) {
			let oldMut = oldMutabilities[prop]
			if (oldMut === undefined) { continue }
			if (ExtendedObject.mutabilityOrder[newMut] < ExtendedObject.mutabilityOrder[oldMut]) {
				return false
			}
		}
		return true
	}

	setMutabilities() {
		Object.defineProperty(this, '_mutabilities', {
			value: this.mutabilities(),
			writable: false,
			enumerable: true
		})
		Object.freeze(this._mutabilities)
	}

	mutability(prop: string): string | null {
		return this._mutabilities[prop] ?? null
	}

	superclassMutability(prop: string): string | null {
		return this._superclassMutabilities[prop] ?? null
	}

	setDefaults() {
		this._defaults = this.defaults()
	}

	updateDefaults(oldDefaults: object, newDefaults: object): object {
		let updatedDefaults = copy(oldDefaults)
		for (let [prop, value] of Object.entries(newDefaults)) {
			let oldMutability = this.superclassMutability(prop) ?? this.mutability(prop) ?? 'always'
			if (oldMutability === 'never' && Object.keys(updatedDefaults).includes(prop)) {
				// immutable property cannot be assigned a new default value
				throw `The immutable property ${prop} on object ${this.constructor.name} cannot be assigned new default value ${value}`
			}
			updatedDefaults[prop] = value
		}
	 	return updatedDefaults
	}

	checkPermissions(args): boolean {
		for (let prop of Object.keys(args)) {
			let mutability = this.mutability(prop)
			if (mutability === 'never' || mutability === 'in_subclass') {
				throw `The property ${prop} on ${this.constructor.name} cannot be changed on initialization`
				return false
			} else if (mutability === 'on_init' && this.initComplete) {
				throw `The property ${prop} on ${this.constructor.name} cannot be changed after initialization`
				return false
			}
		}
		return true
	}

	// synchronizeUpdateArguments(args: object): object {
	// 	return args
	// }

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

	// update(args: object = {}) {
	// 	let ok = Object.keys(args).every((prop) => this.mutability(prop) == 'always')
	// 	if (ok) {
	// 		args = this.removeUnchangedProperties(args)
	// 		this.setProperties(args)
	// 	} else {
	// 		this.checkPermissions(args)
	// 	}
	// }

	// removeUnchangedProperties(args: object): object {
	// 	for (let [prop, value] of Object.entries(args)) {
	// 		if (this[prop] === undefined) { continue }
	// 		if (typeof value != 'object' || value === null) {
	// 			if (this[prop] === value) {
	// 				delete args[prop]
	// 			}
	// 		} else if (value.constructor.name == 'Vertex' || value.constructor.name == 'Transform') {
	// 			if (this[prop].equals(value)) {
	// 				delete args[prop]
	// 			}
	// 		} else {
	// 			if (this[prop] == value) {
	// 				delete args[prop]
	// 			}
	// 		}
	// 	}
	// 	return args
	// }

	setProperties(args: object = {}) {

	// 	args = this.synchronizeUpdateArguments(args)

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

	// copyFrom(obj: ExtendedObject) {
	// 	let args: object = {}
	// 	for (let prop of obj.properties) {
	// 		let mut = this.mutability(prop)
	// 		if (mut !== 'always') {
	// 			throw `Property ${prop} on ${this.constructor.name} cannot be copied from other object`
	// 			continue
	// 		}
	// 		args[prop] = obj[prop]
	// 	}
	// 	this.update(args)
	// }

	// isMutable(prop: string) {
	// 	return (this.mutability(prop) === 'always'
	// 		|| (this.mutability(prop) === 'on_init' && !this.initComplete))
	// }

}



























