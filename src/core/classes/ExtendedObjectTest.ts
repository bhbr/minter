
import { ExtendedObject } from './ExtendedObject'

class FirstClass extends ExtendedObject {

	a: number

	get b(): number {
		return this.a
	}

	set b(newValue: number) {
		this.a = newValue
	}

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: { },
			immutable: {  },
			mutable: { b: 1 }
		})
	}
}

class SecondClass extends FirstClass {}

export function extendedObjectTest() {

	let C = new FirstClass()
	console.log(C)
	let D = new SecondClass()
	console.log(D)

}