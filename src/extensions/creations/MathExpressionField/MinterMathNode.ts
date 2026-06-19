
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
			_value: NaN
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






















