export class A {
	value: number = 1 // non-object is mutable property (default arg)

	constructor(value = 1) {
		this.value = value
		//console.log('A', this)
	}
}

export class B {

	obj: A = new A()

	get value(): number { return this.obj.value }
	set value(newValue: number) { this.obj.value = newValue }

	constructor(val = 2) {
		this.value = val
	}
}

export class C extends B {

	cValue = 4

	constructor(val = 2) {
		super()
		this.value = this.cValue
	}
}


export function OOPTest2() {

	let c = new C()
	console.log(c)
}