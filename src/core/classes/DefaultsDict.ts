
export class DefaultsDict {

	readonly: object
	immutable: object
	mutable: object
	className: string

	constructor(args: object, className: string = '') {
		this.readonly = {}
		this.immutable = {}
		this.mutable = {}
		this.className = className
		this.assign(args)
	}

	static hasDefaultsDictFormat(obj: object): boolean {
		var flag: boolean = true
		for (let key of Object.keys(obj)) {
			flag = flag && ['readonly', 'immutable', 'mutable'].includes(key)
		}
		return flag
	}

	isCompatible(newDefaults: object): boolean {
		var flag: boolean = true
		if (!DefaultsDict.hasDefaultsDictFormat(newDefaults)) {
			console.error(`Incorrect defaults format for class ${this.className}`)
			return
		}
		for (let rKey of Object.keys(this.readonly ?? {})) {
			if (Object.keys(newDefaults['readonly'] ?? {}).includes(rKey)
				|| Object.keys(newDefaults['immutable'] ?? {}).includes(rKey)
				|| Object.keys(newDefaults['mutable'] ?? {}).includes(rKey)) {
				console.error(`Readonly property ${rKey} cannot be reassigned in defaults for class ${this.className}`)
				flag = false
			}
		}
		for (let iKey of Object.keys(this.immutable ?? {})) {
			if (Object.keys(newDefaults['mutable'] ?? {}).includes(iKey)) {
				console.error(`Immutable property ${iKey} cannot be reassigned as mutable in defaults for class ${this.className}`)
				flag = false
			}
		}
		return flag
	}

	assign(newDefaults: object): DefaultsDict {
		
		if (!this.isCompatible(newDefaults)) {
			console.error(`Incompatible defaults for class ${this.className}`)
			return this
		}
		let flattenedOldDefaults = DefaultsDict.flatten(this)
		let flattenedNewDefaults = DefaultsDict.flatten(newDefaults)
		let flattenedUpdatedDefaults = Object.assign(flattenedOldDefaults, flattenedNewDefaults)
		let stackedUpdatedDefaults = DefaultsDict.stack(flattenedUpdatedDefaults)
		Object.assign(this, stackedUpdatedDefaults)
		return this
	}

	static flatten(stackedDefaults: object): object {
		let flattened = {}
		for (let mutability of ['readonly', 'immutable', 'mutable']) {
			for (let [prop, defaultValue] of Object.entries(stackedDefaults[mutability] ?? {})) {
				flattened[prop] = {
					mutability: mutability,
					defaultValue: defaultValue
				}
			}
		}
		return flattened
	}

	static stack(flatDefaults: object): object {
		let stacked = {}
		stacked['readonly'] = {}
		stacked['immutable'] = {}
		stacked['mutable'] = {}
		for (let [prop, dict] of Object.entries(flatDefaults)) {
			stacked[dict['mutability']][prop] = dict['defaultValue']
		}
		return stacked
	}
}


// type Mutability = 'mutable' |'immutable' | 'readonly'

// class PropertyDeclaration {

// 	mutability: Mutability
// 	defaultValue: any

// 	constructor(obj: any = {}) {
// 		if (!PropertyDeclaration.hasPDFormat(obj)) {
// 			console.error('Invalid property declaration format')
// 		}
// 		Object.assign(this, obj)
// 	}

// 	static hasPDFormat(obj: any) {
// 		let keys = Object.keys(obj)
// 		return (keys.includes('mutability')
// 			&& keys.includes('defaultValue')
// 			&& keys.length == 2)
// 	}

// 	static convert(obj: any): PropertyDeclaration {
// 		return new PropertyDeclaration(obj)
// 	}

// 	replaceWith(newPD: PropertyDeclaration) {
// 		if (this.mutability === 'readonly') {
// 			console.error('Readonly property cannot be subclassed')
// 		}
// 		if (this.mutability === 'immutable'
// 			&& newPD.mutability === 'mutable') {
// 			console.error('Immutable property cannot be subclassed as mutable')
// 		}
// 		Object.assign(this, newPD)
// 	}

// }

// export class PropertyDeclarationDict extends Map<string, PropertyDeclaration> {

// 	constructor(obj: any = {}) {
// 		super()
// 		this.subclass(obj)
// 	}

// 	static hasPDDFormat(obj: any): boolean {
// 		return Object.values(obj).every(
// 			(value) => PropertyDeclaration.hasPDFormat(value)
// 		)
// 	}

// 	static hasStackedPDDFormat(obj: any): boolean {
// 		let hasMutabilityKeys = Object.keys(obj).every(
// 			(key) => ['readonly', 'immutable', 'mutable'].includes(key)
// 		)
// 		if (!hasMutabilityKeys)  return false
// 		return Object.values(obj).every(
// 			(value1) => Object.values(value1).every(
// 				(value2) => PropertyDeclaration.hasPDFormat(value2)
// 			)
// 		)
// 	}

// 	static convert(obj: object): PropertyDeclarationDict {
// 		return new PropertyDeclarationDict(obj)
// 	}

// 	static convertFromPDDFormat(obj: object): PropertyDeclarationDict {
// 		return Object.assign(new PropertyDeclarationDict(), obj)
// 	}

// 	static convertFromStackedPDDFormat(obj: object): PropertyDeclarationDict {
// 		let pdd = new PropertyDeclarationDict()
// 		for (let [mutability, defaultValuesDict] of Object.entries(obj)) {
// 			for (let [prop, defaultValue] of Object.entries(defaultValuesDict)) {
// 				pdd[prop] = new PropertyDeclaration({
// 					mutability: mutability,
// 					defaultValue: defaultValue
// 				})
// 			}
// 		}
// 		return pdd
// 	}

// 	mutability(prop: string) {
// 		return this[prop]['mutability']
// 	}

// 	isReadonly(prop: string) { return this.mutability(prop) == 'readonly' }
// 	isImmutable(prop: string) { return this.mutability(prop) == 'immutable' }
// 	isMutable(prop: string) { return this.mutability(prop) == 'mutable' }

// 	subclassWithPD(prop: string, newPD: PropertyDeclaration) {
// 		this[prop].replaceWith(newPD)
// 	}

// 	subclassWithPDD(pdd: object) {
// 		for (let [prop, newPD] of Object.entries(pdd)) {
// 			this.subclassWithPD(prop, newPD)
// 		}
// 	}

// 	static convertStackedPDDFormatToPDDFormat(obj: any): object {
// 		let convertedObj = {}
// 		for (let [mutability, pdDict] of Object.entries(obj)) {
// 			for (let [prop, defaultValue] of Object.entries(pdDict)) {
// 				convertedObj[prop] = {
// 					mutability: mutability,
// 					defaultValue: defaultValue
// 				}
// 			}
// 		}
// 		return convertedObj
// 	}

// 	subclassWithStackedPDD(obj: object) {
// 		this.subclassWithPDD(PropertyDeclarationDict.convertStackedPDDFormatToPDDFormat(obj))
// 	}

// 	subclass(obj: any) {
// 		if (PropertyDeclarationDict.hasPDDFormat(obj)) {
// 			this.subclassWithPDD(obj)
// 			return
// 		}
// 		if (PropertyDeclarationDict.hasStackedPDDFormat(obj)) {
// 			this.subclassWithStackedPDD(obj)
// 			return
// 		}
// 		console.error('Wrong format for subclassing property declaration dict')
// 	}

// }
