export class ExtendedObject {

	passedByValue: boolean

	constructor(argsDict: object = {}) {
		this.passedByValue = false
		this.setAttributes(argsDict)
	}
	
	properties(): Array<string> {
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
		// a key can refer to a property or an accessor (getter/setter)
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

	setAttributes(argsDict: object = {}) {
		for (let [key, value] of Object.entries(argsDict)) {
			let setter: any = this.setter(key)
			if (setter != undefined) {
				setter.call(this, value)
			} else {
				// we have an as-of-yet unknown property
				if (value != undefined && value.passedByValue) {
					// create and copy
					if (this[key] == undefined) {
						this[key] = new value.constructor()
					}
					this[key].copyFrom(value) 
				} else {
					// just link
					this[key] = value
				}
			}
		}
	}

	assureProperty(key: string, cons: any) {
		if (this[key] == undefined) { this[key] = new cons() }
	}

	// we often cannot set default values for properties as declarations alone
	// as these get set too late (at the end of the constructor)
	// instead we call setDefaults at the appropriate time earlier in the constructor
	setDefaults(argsDict: object = {}) {
		let undefinedKVPairs: object = {}
		for (let [key, value] of Object.entries(argsDict)) {
			if (this[key] == undefined) { undefinedKVPairs[key] = value }
		}
		this.setAttributes(undefinedKVPairs)
	}



}