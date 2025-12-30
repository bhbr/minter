import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Lexer } from './Lexer'
import { Parser } from './Parser'

export class MathQuillExpression extends ExtendedObject {
	
	MQ: any
	latex: string
	scope: object
	parser: Parser
	lexer: Lexer

	defaults(): object {
		return {
			latex: '',
			scope: {},
			parser: new Parser(),
			lexer: new Lexer()
		}
	}

	value(): number {
		let tokens = this.lexer.tokenizeTex(this.latex)
		try {
			let node = this.parser.parseTokens(tokens)
			let result = this.parser.evaluateTex(latex, this.scope)
			return result
		} catch (ParseError) {
			return NaN
		}
	}

}