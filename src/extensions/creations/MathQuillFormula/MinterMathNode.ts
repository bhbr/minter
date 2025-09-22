
export class MinterMathNode {
	value(scope: object = {}): number {
		return NaN
	}

	variables(): Array<string> {
		return []
	}
}

export class MinterSymbolNode extends MinterMathNode {
	name: string
	constructor(name: string) {
		super()
		this.name = name
	}
	value(scope: object = {}): number {
		switch (this.name) {
		case 'tau':
			return 2 * Math.PI
		case 'pi':
			return Math.PI
		case 'e':
			return scope['e'] ?? Math.E
		default:
			return scope[this.name] ?? NaN
		}
	}

	variables(): Array<string> {
		if (['tau', 'pi', 'e'].includes(this.name)) {
			return []
		}
		return [this.name]
	}
}

export class MinterConstantNode extends MinterMathNode {
	_value: number
	constructor(value: number) {
		super()
		this._value = value
	}
	value(scope: object = {}): number {
		return this._value
	}
}

export class MinterAssignmentNode extends MinterMathNode {
	symbol: MinterSymbolNode
	child: MinterMathNode
	constructor(symbol, child) {
		super()
		this.symbol = symbol
		this.child = child
	}
	get name(): string {
		return this.symbol.name
	}

	value(scope: object = {}): number {
		return this.child.value(scope)
	}
	variables(): Array<string> {
		return this.child.variables()
	}
}

export class MinterFunctionNode extends MinterMathNode {
	name: string
	child: MinterMathNode

	constructor(name: string, child: MinterMathNode) {
		super()
		this.name = name
		this.child = child
	}
	variables(): Array<string> {
		return this.child.variables()
	}

	value(scope: object = {}): number {
		let a = this.child.value(scope)
		switch (this.name) {
		case 'sin':
			return Math.sin(a)
		case 'cos':
			return Math.cos(a)
		case 'tan':
			return Math.tan(a)
		case 'cot':
			return 1 / Math.tan(a)
		case 'sec':
			return 1 / Math.cos(a)
		case 'csc':
			return 1 / Math.sin(a)
		case 'asin':
		case 'arcsin':
			return Math.asin(a)
		case 'acos':
		case 'arccos':
			return Math.acos(a)
		case 'atan':
		case 'arctan':
			return Math.atan(a)
		case 'sinh':
			return Math.sinh(a)
		case 'cosh':
			return Math.cosh(a)
		case 'tanh':
			return Math.tanh(a)
		case 'sqrt':
			return Math.sqrt(a)
		case 'log':
			return Math.log10(a)
		case 'ln':
			return Math.log(a)
		case 'exp':
			return Math.exp(a)
		default:
			return NaN
		}
	}
}

export class MinterOperatorNode extends MinterMathNode {
	name: string
	children: Array<MinterMathNode>

	constructor(name: string, children: Array<MinterMathNode>) {
		super()
		this.name = name
		this.children = children
	}
	variables(): Array<string> {
		let vars1 = this.children[0].variables()
		let vars2 = this.children[1].variables()
		return vars1.concat(vars2).sort()
	}

	value(scope: object = {}): number {
		let a = this.children[0].value(scope)
		let b = this.children[1].value(scope)
		switch (this.name) {
		case '+':
			return a + b
		case '-':
			return a - b
		case '*':
			return a * b
		case '/':
			return a / b
		case '^':
			return a ** b
		default:
			return NaN
		}
	}
}












