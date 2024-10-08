export type Mutability = 'mutable' | 'immutable' | 'readonly'

export class DefaultsDict {

	mutable: object
	immutable: object
	readonly: object

	constructor(args: object = {}) {
		this.mutable = args['mutable'] || {}
		this.immutable = args['immutable'] || {}
		this.readonly = args['readonly'] || {}
	}

	mutableKeys() {
		return Object.keys(this.mutable)
	}

	immutableKeys() {
		return Object.keys(this.immutable)
	}

	readonlyKeys() {
		return Object.keys(this.readonly)
	}

	mutability(arg: string): Mutability | null {
		if (this.mutableKeys().includes(arg)) {
			return 'mutable'
		}
		if (this.immutableKeys().includes(arg)) {
			return 'immutable'
		}
		if (this.readonlyKeys().includes(arg)) {
			return 'readonly'
		}
		return null
	}

	isMutable(prop: string): boolean {
		return this.mutability(prop) == 'mutable'
	}

	isImmutable(prop: string): boolean {
		return this.mutability(prop) == 'immutable'
	}

	isReadonly(prop: string): boolean {
		return this.mutability(prop) == 'readonly'
	}

	valueFor(prop: string): any {
		return this[this.mutability(prop)][prop]
	}

	isDefined(prop: string): boolean {
		return this.valueFor(prop) !== undefined
	}

	keys(): Array<string> {
		return this.mutableKeys().concat(this.immutableKeys()).concat(this.readonlyKeys())
	}

	static hasDefaultDictFormat(dict: object): boolean {
		for (let key of Object.keys(dict)) {
			if (!(['mutable', 'immutable', 'readonly'].includes(key))) {
				return false
			}
		}
		return true
	}

	subclassWithDefaultsDict(def: object) {

		let defDict = new DefaultsDict(def)

		let rSubclassDict = {}

		for (let rKey of this.readonlyKeys()) {
			if (defDict.isMutable(rKey)) {
				console.warn(`Readonly property ${rKey} cannot be subclassed to mutable`)
			} else if (defDict.isImmutable(rKey)) {
				console.warn(`Readonly property ${rKey} cannot be subclassed to immutable`)
			} else if (defDict.isReadonly(rKey) && this.readonly[rKey] !== undefined) {
				console.warn(`Readonly property ${rKey} cannot be redefined`)
			} else {
				rSubclassDict[rKey] = defDict.readonly[rKey]
			}
		}

		for (let rKey of defDict.readonlyKeys()) {
			if (!(this.readonlyKeys().includes(rKey))) {
				rSubclassDict[rKey] = defDict.readonly[rKey]
			}
		}

		for (let [key, value] of Object.entries(rSubclassDict)) {
			this.readonly[key] = value
		}

		let iSubclassDict = {}

		for (let iKey of this.immutableKeys()) {
			if (defDict.isMutable(iKey)) {
				console.warn(`Immutable property ${iKey} cannot be subclassed to mutable`)
			} else {
				iSubclassDict[iKey] = defDict.immutable[iKey]
			}
		}

		for (let iKey of defDict.immutableKeys()) {
			if (!this.immutableKeys().includes(iKey)) {
				iSubclassDict[iKey] = defDict.immutable[iKey]
			}
		}

		for (let [key, value] of Object.entries(iSubclassDict)) {
			this.immutable[key] = value
		}

		this.mutable = Object.assign(this.mutable, defDict.mutable)
		return this

	}

	subclassWithPropertyValues(args: object) {
		let def = new DefaultsDict()
		for (let [prop, value] of Object.entries(args)) {
			def[this.mutability(prop)][prop] = value
		}
		return this.subclassWithDefaultsDict(def)
	}

	subclass(args: object) {
		if (DefaultsDict.hasDefaultDictFormat(args)) {
			return this.subclassWithDefaultsDict(args)
		} else {
			return this.subclassWithPropertyValues(args)
		}
	}

}
