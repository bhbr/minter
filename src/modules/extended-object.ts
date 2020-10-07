export class ExtendedObject {

	constructor(argsDict: object = {}) {
		this.setAttributes(argsDict)
		if (argsDict['scale'] != undefined) {
		}
	}
	
	properties(): Array<string> {
		let obj: object = this
		let properties: Array<string> = []
		while (obj.constructor.name != 'Object') {
			properties.push(...Object.getOwnPropertyNames(obj))
			obj = Object.getPrototypeOf(obj)
		}
		return properties
	}

	setter(key: string): any {
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
				if (this[key] != undefined && this[key].constructor.name == 'Vertex')
					{ this[key].copyFrom(value) }
				else {
					this[key] = value
				}
			}
		}
	}

	assureProperty(key: string, cons: any) {
		if (this[key] == undefined) { this[key] = new cons() }
	}

	setDefaults(argsDict: object = {}) {
		let undefinedKVPairs: object = {}
		for (let [key, value] of Object.entries(argsDict)) {
			if (this[key] == undefined) { undefinedKVPairs[key] = value }
		}
		this.setAttributes(undefinedKVPairs)
	}



}