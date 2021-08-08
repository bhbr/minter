

export class A {
	value: number

}

export class B {
	a1: A

	constructor(args = {}) {
		console.log('B.constructor')
		this.a1 = new A()
		if (this.constructor.name == 'B') {
			this.update(args)
		}
	}

	update(args = {}) {
		console.log('B.update')
		this.a1.value = args['value1']
	}
}

export class C extends B {
	a2: A

	constructor(args = {}) {
		console.log('C.constructor')
		super()
		this.a2 = new A()
		if (this.constructor.name == 'C') {
			this.update(args)
		}
	}

	update(args = {}) {
		console.log('C.update')
		super.update(args)
		this.a2.value = args['value2']
	}
}

export function OOPTest() {
	let c = new C({value1: 1, value2: 2})
	console.log(c.constructor.prototype)
}



