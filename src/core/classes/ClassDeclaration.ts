
import { MutabilityError, AssignmentError } from './Errors'

export class ClassDeclaration {
/*
A ClassDeclaration is an abstracted version of the default values and associated mutabilities defined in the subclasses of Mobjects (actually, ExtendedObjects in general). Its purpose is to check the validity of the overridden defaults() and mutabilities() methods.
*/
	name: string // of the class
	parent: ClassDeclaration | null // null for the base class ExtendedObject
	mutabilities: object // format:  { propertyName : mutability }
	defaults: Function // must be a function that creates new copies of the defaults object to instantiate new objects, so they won't share references (e. g. pointing to the same <div>)

	fullMutabilities: object // as collected from all the parent classes
	fullDefaults: object // as collected from all the parent classes

	/*
	Comparing mutabilities: from laxest ('always') to strictest ('never'). A subclass can change a property's mutability only to a stricter level.
	See ExtendedObject for a description of the mutability levels.
	*/
	private static mutabilityOrder = {
		'always': 0, 'on_update': 1, 'on_init': 2, 'in_subclass': 3, 'never': 4
	}
	private static compatibleMutabilities(oldMut, newMut): boolean {
	// Is the dictionary of newMutabilities a valid extension of the oldMutabilities? It is only valid if mutabilities of existing properties get restricted, they can never be expanded again.
		return (ClassDeclaration.mutabilityOrder[oldMut] <= ClassDeclaration.mutabilityOrder[newMut])
	}

	constructor(args: object) {
		this.name = args['name']
		this.parent = args['parent']
		this.mutabilities = Object.assign({}, args['mutabilities']) // a fresh copy (so it can be altered without propagating back into the parent classes)
		this.defaults = args['defaults'] // a *function* object that will create a fresh default object for each new object instance (including e. g. new DOM elements)

		this.initializeFullMutabilities() // collect and merge the mutabilities objects of all ancestor classes
		this.initializeFullDefaults() // collect and merge the defaults objects (return values of the defaults functions) of all parent classes
	}

	mutability(prop: string): string {
	// If the class doesn't specify a mutability, look into the ancestor classes. If they don't either, the default mutability is 'always'.
		return this.mutabilities[prop] ?? this.fullMutabilities[prop] ?? 'always'
	}

	private initializeFullMutabilities() {
	// Collect and merge the mutabilities objects of all ancestor classes into a single object
		this.fullMutabilities = {}
		// Collect the entire mutabilities from all ancestor classes
		if (this.parent) { Object.assign(this.fullMutabilities, this.parent.fullMutabilities) }
		// Check the own mutabilities are compatible with them, then update
		this.checkMutabilities()
		Object.assign(this.fullMutabilities, this.mutabilities)
		// Properties with no mentioned mutability are set to the default mutability 'always'
		for (let prop of Object.keys(this.defaults())) {
			if (this.fullMutabilities[prop] === undefined) {
				this.fullMutabilities[prop] = 'always'
			}
		}
	}

	private initializeFullDefaults() {
	// Collect and merge the defaults of all ancestor classes, as a function
		this.checkDefaults()
		this.fullDefaults = function() {
			let parentDefaults = this.parent ? this.parent.fullDefaults() : {}
			return Object.assign(parentDefaults, this.defaults())
		}
	}

	checkMutabilities() {
	// Are the mutabilities specified in the class's mutabilities() method compatible with the ones inherited from the parent class?
		for (let [prop, newMut] of Object.entries(this.mutabilities)) {
			let oldMut = this.parent ? this.parent.mutability(prop) : 'always'
			if (!ClassDeclaration.compatibleMutabilities(oldMut, newMut)) {
				throw new MutabilityError(`Mutability of property ${prop} in class ${this.name} cannot be changed from ${oldMut} to ${newMut}`)
			}
		}
	}

	checkDefaults() {
	// Are the default values specified in the class's defaults() method compatible with the mutabilities inherited from the parent class?
		for (let [prop, value] of Object.entries(this.defaults())) {
			let oldMut = this.parent ? this.parent.mutability(prop) : 'always'
			if (oldMut === 'never') {
				throw new AssignmentError(`Property ${prop} in class ${this.name} is immutable, cannot be assigned new default value ${value}`)
			}
		}
	}

	ancestry(): Array<string> {
	// For debugging, a list of the names of the parent classes:
	// ['ExtendedObject', ..., <this.parent.name>, <this.name>]
		let ret: Array<string> = []
		var dec: ClassDeclaration | null = this
		while (dec != null) {
			ret.push(dec.name)
			dec = dec.parent
		}
		return ret.reverse()
	}





















}