
import { ExtendedObject } from './ExtendedObject'

class FirstClass extends ExtendedObject {

	a: number
	_b: number

	get b(): number {
		return this._b
	}

	set b(newValue: number) {
		this._b = newValue
	}

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			a: 1,
			_b: 2
		})
	}

	defs(): object {
		return {d:1}
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			a: 'always',
			b: 'on_init'
		})
	}

	synchronizeUpdateArguments(args: object): object {
		if (Object.keys(args).includes('_b')) {
			console.warn('Args contain _b')
			delete args['_b']
		}
		return args
	}

	allDefs(): object {
		var all = {}
		var obj = this
		while (obj.constructor.name !== 'BaseExtendedObject') {
			console.log(obj)
			all = Object.assign(all, obj.defs())
			obj = Object.create(Object.getPrototypeOf(obj))
		}
		return all
	}
}

class SecondClass extends FirstClass {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			a: 3,
			b: 10
		})
	}

	defs(): object {
		return {e:2}
	}

	// mutabilities(): object {
	// 	return this.updateMutabilities(super.mutabilities(), {
	// 		b: 'never'
	// 	})
	// }
}

class ThirdClass extends SecondClass {
	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			b: -1
		})
	}
}

export function extendedObjectTest() {

	let A = new ThirdClass({b: -2})
	A.update({_b: -3})
	console.log((A as FirstClass).defs())





}