

export class A {
	value: number
}

export class B {
	a1: A

	constructor(argsDict = {}) {
		console.log('B.constructor')
		this.a1 = new A()
		if (this.constructor.name == 'B') {
			this.update(argsDict)
		}
	}

	update(argsDict = {}) {
		console.log('B.update')
		this.a1.value = argsDict['value1']
	}
}

export class C extends B {
	a2: A

	constructor(argsDict = {}) {
		console.log('C.constructor')
		super()
		this.a2 = new A()
		if (this.constructor.name == 'C') {
			this.update(argsDict)
		}
	}

	update(argsDict = {}) {
		console.log('C.update')
		super.update(argsDict)
		this.a2.value = argsDict['value2']
	}
}

export function OOPTest() {
	let c = new C({value1: 1, value2: 2})
	console.log(c)
}



