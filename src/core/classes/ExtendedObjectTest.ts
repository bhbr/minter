
import { ExtendedObject } from './ExtendedObject'

class FirstClass extends ExtendedObject {

	a: number
	b: number
	c: number

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: { },
			immutable: {  },
			mutable: {a: undefined  }
		})
	}
}

export class SecondClass extends FirstClass {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {},
			immutable: {},
			mutable: {a: 1}
		})
	}
}

export function extendedObjectTest() {

	let B = new SecondClass({a: 2})
	B.update({a: 3})
	console.log(B)

}