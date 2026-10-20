
import { BetterObject } from '@bhbr/better-things'
import { OldParser } from './OldParser.js'
import { AssignmentNode } from './MathNode.js'
import { remove } from '@bhbr/betray'
import { getPaper } from 'functions/getters.js'

export class MathExpression extends BetterObject {
	
	latex: string
	scope: object
	parser: OldParser | null

	defaults(): object {
		return {
			latex: '',
			scope: getPaper().globals,
			parser: null
		}
	}

	value(): number {
		try {
			let result = this.parser.evaluateTex(this.latex, this.scope)
			return result
		} catch (ParseError) {
			return NaN
		}
	}

	outputVariable(): string | null {
		if (!this.parser) { return null }
		let node = this.parser.parseTex(this.latex)
		if (node instanceof AssignmentNode) {
			return node.symbol.name
		}
		return null
	}

	inputVariables(): Array<string> {
		let node = this.parser.parseTex(this.latex)
		let vars: Array<string> = node.variables()
		let outputVariable = this.outputVariable()
		if (outputVariable) {
			remove(vars, outputVariable)
		}
		return vars

	}


}