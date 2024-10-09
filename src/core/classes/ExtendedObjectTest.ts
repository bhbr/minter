
import { ExtendedObject } from './ExtendedObject'
import { DefaultsDict } from './DefaultsDict'

class FirstClass extends ExtendedObject {

	a: number
	b: number
	c: number

	defaults(): DefaultsDict {
		let def = super.defaults()
		return def.assign({
			readonly: { },
			immutable: {  },
			mutable: {a: undefined  }
		})
	}
}

export class SecondClass extends FirstClass {

	defaults(): DefaultsDict {
		let def = super.defaults()
		return def.assign({
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