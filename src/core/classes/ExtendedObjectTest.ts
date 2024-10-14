
import { ExtendedObject } from './ExtendedObject'

class FirstClass extends ExtendedObject {

	//a: number
	_b: number

	get b(): number {
		return this._b
	}

	set b(newValue: number) {
		this._b = newValue
	}

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: { a: 1},
			immutable: { b: 2 },
			mutable: { }
		})
	}
}

class SecondClass extends FirstClass {}

export function extendedObjectTest() {

	let C = new FirstClass({a: 2})
	let desc1 = C.propertyDescriptor('a')
	let desc2 = C.propertyDescriptor('b')
	let desc3 = C.propertyDescriptor('c')
	console.log('a', desc1)
	console.log('b', desc2)
	console.log('c', desc3)
}