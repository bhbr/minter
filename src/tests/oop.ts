

export class A {
	value: number
}

export class Z {}

export class B extends Z {
	a1: A

	constructor(argsDict: object = {}) {
		console.log('B.constructor')
		super()
		this.a1 = new A()
		this.update(argsDict)
	}

	update(argsDict: object = {}) {
		if (Object.keys(argsDict).length == 0) { return }
		console.log('B.update')
		this.a1.value = argsDict['value1']
	}
}

export class C extends B {
	a2: A

	constructor(argsDict: object = {}) {
		console.log('C.constructor')
		console.log(Object.keys(argsDict))
		super()
		this.a2 = new A()
	}

	update(argsDict: object = {}) {
		console.log('C.update')
		super.update(argsDict)
		this.a2.value = argsDict['value2']
	}
}

export function OOPTest() {
	let c = new C({value1: 1, value2: 2})
	console.log(c)
}



