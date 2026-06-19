
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { isNumber, isLetter } from './MinterLexer'
import { Mobject } from 'core/mobjects/Mobject'

export class MinterMathNode extends Mobject {
	
	getValue(): number {
		return NaN
	}
}

export class MinterNumberNode extends MinterMathNode {
	
	value: number

	defaults(): object {
		return {
			value: NaN
		}
	}

	getValue(): number {
		return this.value
	}
}

export class MinterVariableNode extends MinterMathNode {

	name: string

	defaults(): object {
		return {
			name: 'x'
		}
	}

	getValue(): number {
		return getPaper().globals[this.name] ?? NaN
	}
}

export class MinterFunctionNode extends MinterMathNode {

	name: string
	child: MinterMathNode
	functionDict: Record<string, (number) => number>

	defaults(): object {
		return {
			name: 'id',
			functionDict: {
				'id': (x) => x,
				'\\sqrt': Math.sqrt,
				'\\sin': Math.sin,
				'\\cos': Math.cos
			},
			child: new MinterMathNode()
		}
	}

	getValue(): number {
		let f = this.functionDict[this.name]
		return f(this.child.getValue())
	}
}

export class MinterGroupNode extends MinterMathNode {

	parenType: '(' | '[' | '{' | '\\{'
	child: MinterMathNode

	defaults(): object {
		return {
			parenType: '(',
			child: new MinterMathNode()
		}
	}

	getValue(): number {
		return this.child.getValue()
	}
}

export class MinterOperatorNode extends MinterMathNode {

	operator: string
	child1: MinterMathNode
	child2: MinterMathNode

	defaults(): object {
		return {
			operator: '+',
			child1: new MinterMathNode(),
			child2: new MinterMathNode()
		}
	}

	getValue(): number {
		let a = this.child1.getValue()
		let b = this.child2.getValue()
		switch (this.operator) {
		case '+':
			return a + b
		case '-':
			return a - b
		case '\\cdot':
			return a + b
		case '/':
			return a / b
		case '^':
			return a ** b
		default:
			return NaN
		}
	}
}

export class MinterFractionNode extends MinterOperatorNode {

	defaults(): object {
		return {
			operator: '/'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

	get numerator(): MinterMathNode {
		return this.child1
	}
	set numerator(newValue: MinterMathNode) {
		this.child1 = newValue
	}

	get denominator(): MinterMathNode {
		return this.child2
	}
	set denominator(newValue: MinterMathNode) {
		this.child2 = newValue
	}

}



















