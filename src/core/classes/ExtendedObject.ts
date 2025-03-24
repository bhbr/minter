
import { equalObjects } from 'core/functions/copying'
import { ClassDeclaration } from './ClassDeclaration'
import { log } from 'core/functions/logging'
import { isVertex, vertexEquals, isVertexArray, vertexArrayEquals } from 'core/functions/vertex'

export class ExtendedObject {

	private static classDeclarations: object
	properties: Array<string>
	// set to true when all properties are initialized (nothing left undefined)

	mutabilities(): object { return {} }
	defaults(): object { return {} }

	constructor(args: object = {}) {

		if (ExtendedObject.classDeclarations === undefined) {
			ExtendedObject.classDeclarations = {
				ExtendedObject: new ClassDeclaration({
					name: 'ExtendedObject',
					parent: null,
					mutabilities: {},
					defaults: function() { return {} }
				})
			}
		}

		if (ExtendedObject.classDeclarations[this.constructor.name] === undefined) {
			
			let protos = this.prototypes()
			for (let obj of protos) {
				if (ExtendedObject.classDeclarations[obj.constructor.name] !== undefined) {
					continue
				}

				let parentClass = Object.getPrototypeOf(obj)

				var newMuts = obj.mutabilities()
				let oldMuts = parentClass.mutabilities()
				if (equalObjects(oldMuts, newMuts)) {
					newMuts = {}
				}
				let newDefsObj = obj.defaults()
				let oldDefsObj = parentClass.defaults()
				let flag = equalObjects(oldDefsObj, newDefsObj)
				let newDefs = flag ? function() { return {} } : obj.defaults

				let classDecName = obj.constructor.name
				let parentClassName = parentClass.constructor.name
				let parentClassDec = ExtendedObject.classDeclarations[parentClassName]
				ExtendedObject.classDeclarations[classDecName] = new ClassDeclaration({
					name: classDecName,
					parent: parentClassDec,
					mutabilities: newMuts,
					defaults: newDefs
				})
			}

		}

		this.checkInitArgs(args)
		let inits = this.fullDefaults()
		Object.assign(inits, args)
		Object.defineProperty(this, 'properties', {
			value: [],
			writable: false,
			enumerable: true
		})
		this.setProperties(inits)
	}

	private prototypes(): Array<ExtendedObject> {
		let ret: Array<ExtendedObject> = []
		var obj = Object.getPrototypeOf(this)
		while (obj != null) {
			ret.push(obj)
			obj = Object.getPrototypeOf(obj)
		}
		ret.pop() // superfluous Object
		return ret.reverse()
	}

	ancestry(): Array<string> {
		return this.prototypes().map((obj) => obj.constructor.name)
	}

	private checkInitArgs(args: object) {
		let dec = ExtendedObject.classDeclarations[this.constructor.name]
		for (let [prop, value] of Object.entries(args)) {
			if (dec.mutability(prop) === 'never' || dec.mutability(prop) === 'in_subclass') {
				throw `Property ${prop} in class ${this.constructor.name} is immutable, cannot be reassigned on object creation`
			}
		}
	}


	private setProperties(args: object = {}) {

	 	let syncedArgs = this.synchronizeUpdateArguments(args)

		let accessorArgs: object = {}
		let otherPropertyArgs: object = {}

		for (let [prop, value] of Object.entries(syncedArgs)) {
			if (this.isSetter(prop)) {
	 			accessorArgs[prop] = value
	 		} else {
	 			otherPropertyArgs[prop] = value
	 		}
		}

		for (let [prop, value] of Object.entries(otherPropertyArgs)) {
			this.setProperty(prop, value)
		}
		for (let [prop, value] of Object.entries(accessorArgs)) {
			this.setProperty(prop, value)
	 	}
	}

	private setProperty(prop: string, value: any) {
		let desc = this.propertyDescriptor(prop)
		if (desc === undefined) {
			Object.defineProperty(this, prop, {
				value: value,
				writable: (this.mutability(prop) === 'always'),
				enumerable: true
			})
			this.properties.push(prop)
		} else {
			let setter = this.setter(prop)
			if (setter !== undefined) {
				setter.call(this, value)
			} else {
				try {
					this[prop] = value
				} catch {
					log(`${this}, ${prop}, ${value}`)
					throw `Attempt to assign to readonly property`
				}
			}
		}
	}

	private isSetter(prop: string): boolean {
		let pd = this.propertyDescriptor(prop)
		if (pd === undefined) { return false }
		let s = pd['set']
		return s !== undefined
	}

	private propertyDescriptors(): object {
		let pds = {}
		var obj = this
		while (obj) {
			pds = Object.assign(pds, Object.getOwnPropertyDescriptors(obj))
			obj = Object.getPrototypeOf(obj)
		}
		return pds
	}

	private propertyDescriptor(prop: string): PropertyDescriptor | undefined {
		let pds = this.propertyDescriptors()
		return pds[prop]
	}

	private setter(prop: string): any {
		let pd = this.propertyDescriptor(prop)
		return (pd === undefined) ? undefined : pd.set
	}


	mutability(prop: string): string {
		return ExtendedObject.classDeclarations[this.constructor.name].mutability(prop)
	}

	isMutable(prop: string) {
		return (this.mutability(prop) === 'always')
	}

	synchronizeUpdateArguments(args: object): object {
		return args
	}

	private checkUpdateArgs(args: object) {
		let dec = ExtendedObject.classDeclarations[this.constructor.name]
		for (let [prop, value] of Object.entries(args)) {
			if (dec.mutability(prop) !== 'always') {
				throw `Property ${prop} in class ${this.constructor.name} is immutable, cannot be reassigned on object update`
			}
		}
	}

	update(args: object = {}) {
		this.checkUpdateArgs(args)
		args = this.removeUnchangedProperties(args)
			this.setProperties(args)
		}
	
	private removeUnchangedProperties(args: object): object {
		for (let [prop, value] of Object.entries(args)) {
			if (this[prop] === undefined) { continue }
			if (typeof value != 'object' || value === null) {
				if (this[prop] === value) {
					delete args[prop]
				}
			} else if (value.constructor.name == 'Transform') {
				if (this[prop].equals(value)) {
					delete args[prop]
				}
			} else if (isVertex(value)) {
				if (vertexEquals(this[prop], value)) {
					delete args[prop]
				}
			} else if (isVertexArray(value)) {
				if (vertexArrayEquals(this[prop], value)) {
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

	fullDefaults(): object {
		return ExtendedObject.classDeclarations[this.constructor.name].fullDefaults()
	}

	fullMutabilities(): object {
		return ExtendedObject.classDeclarations[this.constructor.name].fullMutabilities
	}


	copyFrom(obj: ExtendedObject) {
		let argsDict: object = {}
		for (let prop of obj.properties) {
			argsDict[prop] = obj[prop]
		}
		this.update(argsDict)
	}

	static clearClassDeclarations() {
		ExtendedObject.classDeclarations = undefined
	}

}


























