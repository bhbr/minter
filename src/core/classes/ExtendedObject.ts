
import { equalObjects, isInstance } from 'core/functions/copying'
import { ClassDeclaration } from './ClassDeclaration'
import { log } from 'core/functions/logging'
import { isVertex, vertexEquals, isVertexArray, vertexArrayEquals } from 'core/functions/vertex'
import { AssignmentError } from './Errors'

export class ExtendedObject {
/*
An ExtendedObject 
*/
	private static classDeclarations: object // format: { className: classDeclaration }
	properties: Array<string>
	unsettableProperties: object

	mutabilities(): object { return {} }
	defaults(): object { return {} }

	constructor(args: object = {}) {

		// Create the static classDeclarations object if it hasn't been done yet
		if (ExtendedObject.classDeclarations === undefined) {
			ExtendedObject.initializeClassDeclarations()
		}

		// If this is the first instance of a subclass, register the class declaration
		if (ExtendedObject.classDeclarations[this.constructor.name] === undefined) {
			// This requires all ancestor classes to be registered already, so loop over their prototypes
			let protos = this.prototypes()
			for (let obj of protos) {
				if (ExtendedObject.classDeclarations[obj.constructor.name] !== undefined) { continue }
				obj.registerOwnClassDeclaration()
			}
		}

		// Initialize the list of properties
		Object.defineProperty(this, 'properties', {
			value: [],
			writable: false,
			enumerable: true
		})
		Object.defineProperty(this, 'unsettableProperties', {
			value: {},
			writable: false,
			enumerable: true
		})
		// Are the initialization values valid?
		this.checkConstructorArgs(args)
		// If yes, complement them with the default values and set them
		let initialArgs = this.fullDefaults()
		Object.assign(initialArgs, args)
		this.setProperties(initialArgs)
	}

	private registerOwnClassDeclaration() {
		let parentClass = Object.getPrototypeOf(this)

		// Get the mutabilities
		var mutabilities = this.mutabilities()
		// If the class does not subclass the mutabilities() method, this would just call super method. In that case set the mutabilities to an empty object to express that nothing has changed in the subclass.
		let parentMutabilities = parentClass.mutabilities()
		if (equalObjects(parentMutabilities, mutabilities)) { mutabilities = {} }

		// Get the defaults function/method
		// In order to decide whether this one has been overridden, evaluate both the method and the super method and compare the generated defaults objects. If they are the same, retain a function that creates an empty object.
		let defaultsObject = this.defaults()
		let parentDefaultsObject = parentClass.defaults()
		let flag = equalObjects(parentDefaultsObject, defaultsObject)
		let defaultsFunction = flag ? function() { return {} } : this.defaults

		// Create the class declaration from the class name, parent class declaration, mutabilities object and defaults function
		let classDeclarationName = this.constructor.name
		let parentClassName = parentClass.constructor.name
		let parentClassDeclaration = ExtendedObject.classDeclarations[parentClassName]
		ExtendedObject.classDeclarations[classDeclarationName] = new ClassDeclaration({
			name: classDeclarationName,
			parent: parentClassDeclaration,
			mutabilities: mutabilities,
			defaults: defaultsFunction
		})

	}

	private static initializeClassDeclarations() {
		ExtendedObject.classDeclarations = {
			// the first entry is for the base class
			ExtendedObject: new ClassDeclaration({
				name: 'ExtendedObject',
				parent: null,
				mutabilities: {},
				defaults: function() { return {} }
			})
		}
	}

	private prototypes(): Array<ExtendedObject> {
	// A list of the class's prototype object, from ExtendedObject to the class itself
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
	// for debugging
		return this.prototypes().map((obj) => obj.constructor.name)
	}

	private checkConstructorArgs(args: object) {
	// Only properties with mutability 'always' or 'on_init' can be set in the constructor call
		for (let [prop, value] of Object.entries(args)) {
			if (this.mutability(prop) === 'never' || this.mutability(prop) === 'in_subclass') {
				throw new AssignmentError(`Property ${prop} in class ${this.constructor.name} cannot be assigned new value ${value} in constructor`)
			}
		}
	}

	private setProperties(args: object = {}) {

	 	let syncedArgs = this.synchronizeUpdateArguments(args)

	 	// Accessors (abstract properties that are just setters, e. g. a Circle's midpoint) are set only after all non-accessors have been set. So we split the args along that separation.
		let accessorArgs: object = {}
		let otherPropertyArgs: object = {}
		for (let [prop, value] of Object.entries(syncedArgs)) {
			if (this.isAccessor(prop)) {
	 			accessorArgs[prop] = value
	 		} else {
	 			otherPropertyArgs[prop] = value
	 		}
		}

		// Set the non-accessors (properties that have their own state)
		for (let [prop, value] of Object.entries(otherPropertyArgs)) {
			this.setProperty(prop, value)
		}
		// Set the accessors (abstract properties)
		for (let [prop, value] of Object.entries(accessorArgs)) {
			this.setProperty(prop, value)
	 	}
	}

	private setProperty(prop: string, value: any) {
		if (!this.properties.includes(prop) && !this.isAccessor(prop)) {
			this.createProperty(prop, value)
		} else {
			if (this.isAccessor(prop)) {
				let accessor = this.getAccessor(prop)
				accessor.call(this, value)
				return
			}
			if (this.isSettable(prop)) {
				this[prop] = value
			} else {
				this.unsettableProperties[prop] = value
			}

		}
	}

	createProperty(prop: string, value: any) {
	// that can only the changed via the update() method
		let isSettable = (this.mutability(prop) == 'always')
		if (isSettable) {
			Object.defineProperty(this, prop, {
				value: value,
				writable: true,
				enumerable: true
			})
		} else {
			this.unsettableProperties[prop] = value
			Object.defineProperty(this, prop, {
				get() {
					return this.unsettableProperties[prop]
				},
				set(newValue) {
					throw new AssignmentError(`Use the update method to change the value of property ${prop} in class ${this.constructor.name}`)
				},
				enumerable: true
			})
		}
		this.properties.push(prop)
	}

	isAccessor(prop: string): boolean {
		if (Object.keys(this.unsettableProperties).includes(prop)) { return false }
		let pd = this.propertyDescriptor(prop)
		if (pd === undefined) { return false }
		if (!pd.enumerable) { return true }
		let s = pd['set']
		let flag = (s !== undefined)
		return flag
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

	propertyDescriptor(prop: string): PropertyDescriptor | undefined {
		let pds = this.propertyDescriptors()
		return pds[prop]
	}

	private getAccessor(prop: string): any {
		let pd = this.propertyDescriptor(prop)
		return (pd === undefined || pd.enumerable) ? undefined : pd.set
	}


	mutability(prop: string): string {
		return ExtendedObject.classDeclarations[this.constructor.name].mutability(prop)
	}

	isSettable(prop: string) {
		return (this.mutability(prop) === 'always')
	}

	synchronizeUpdateArguments(args: object): object {
		return args
	}

	private checkUpdateArgs(args: object) {
		for (let [prop, value] of Object.entries(args)) {
			if (this.mutability(prop) !== 'always' && this.mutability(prop) !== 'on_update') {
				throw new AssignmentError(`Property ${prop} in class ${this.constructor.name} is not updatable, cannot be assigned new value ${value} after initialization`)
			}
		}
	}


	update(args: object = {}) {
		this.checkUpdateArgs(args)
		args = this.synchronizeUpdateArguments(args)
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


























