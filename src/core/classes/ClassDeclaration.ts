
export class ClassDeclaration {

	name: string
	parent: ClassDeclaration | null
	mutabilities: object
	defaults: Function

	fullMutabilities: object
	fullDefaults: object

	private static mutabilityOrder = {
		'always': 0, 'on_init': 1, 'in_subclass': 2, 'never': 3
	}
	private static compatibleMutabilities(oldMut, newMut): boolean {
		return (ClassDeclaration.mutabilityOrder[newMut] >= ClassDeclaration.mutabilityOrder[oldMut])
	}

	constructor(args: object) {
		this.name = args['name']
		this.parent = args['parent']
		this.mutabilities = Object.assign({}, args['mutabilities'])
		this.defaults = args['defaults']
		this.fullMutabilities = {}
		if (this.parent) {
			Object.assign(this.fullMutabilities, this.parent.fullMutabilities)
		}

		this.checkMutabilities()
		this.checkDefaults()

		Object.assign(this.fullMutabilities, this.mutabilities)
		for (let prop of Object.keys(this.defaults)) {
			if (this.fullMutabilities[prop] === undefined) {
				this.fullMutabilities[prop] = 'always'
			}
		}
 
		this.fullDefaults = function() {
			let parentDefaults = this.parent ? this.parent.fullDefaults() : {}
			return Object.assign(parentDefaults, this.defaults())
		}

	}

	mutability(prop: string): string {
		return this.mutabilities[prop] ?? this.fullMutabilities[prop] ?? 'always'
	}

	checkMutabilities() {
		for (let [prop, newMut] of Object.entries(this.mutabilities)) {
			let oldMut = this.parent ? this.parent.mutability(prop) : 'always'
			if (!ClassDeclaration.compatibleMutabilities(oldMut, newMut)) {
				throw `Mutability of property ${prop} cannot be changed from ${oldMut} to ${newMut} in class ${this.name}`
			}
		}
	}

	checkDefaults() {
		for (let [prop, value] of Object.entries(this.defaults())) {
			let oldMut = this.parent ? this.parent.mutability(prop) : 'always'
			if (oldMut === 'never') {
				throw `Property ${prop} is immutable, cannot be assigned a new default value in class ${this.name}`
			}
		}
	}

	ancestry(): Array<string> {
		let ret: Array<string> = []
		var dec: ClassDeclaration | null = this
		while (dec != null) {
			ret.push(dec.name)
			dec = dec.parent
		}
		return ret.reverse()
	}





















}