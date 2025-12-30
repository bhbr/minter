import { MathWrapper } from './customMath'
import { ParseError } from './ParseError'
import { Token, TokenType, typeToOperation, lexemeToType } from './Token'
import { MinterMathNode, MinterSymbolNode, MinterConstantNode, MinterFunctionNode, MinterOperatorNode, MinterAssignmentNode } from './MinterMathNode'

/**
* Create the corresponding MathJS node of a Token and its children.
* @returns A newly constructed MathJS node.
*/
export function createMinterMathNode(token: Token, children: Array<MinterMathNode> = []): MinterMathNode {
	let fn = typeToOperation[token.type]
	switch (token.type) {
	case TokenType.Minus:
		// mathjs differentiates between subtraction and the unary minus
		fn = children.length === 1 ? 'unaryMinus' : fn
		// falls through
	case TokenType.Plus:
		return new MinterOperatorNode((token.type == TokenType.Plus) ? '+' : '-', children)
	case TokenType.Star:
		return new MinterOperatorNode('*', children)
	case TokenType.Frac:
	case TokenType.Slash:
		return new MinterOperatorNode('/', children)
	case TokenType.Caret:
		if (children.length < 2) {
			throw new ParseError('Expected two children for ^ operator', token)
		}
		return new MinterOperatorNode('^', children)
	// mathjs built-in functions
	case TokenType.Sqrt:
	case TokenType.Sin:
	case TokenType.Cos:
	case TokenType.Tan:
	case TokenType.Csc:
	case TokenType.Sec:
	case TokenType.Cot:
	case TokenType.Sinh:
	case TokenType.Cosh:
	case TokenType.Tanh:
	case TokenType.Arcsin:
	case TokenType.Arccos:
	case TokenType.Arctan:
	case TokenType.Log:
	case TokenType.Ln:
		return new MinterFunctionNode(fn, children[0])
	case TokenType.Equals:
		return new MinterAssignmentNode(children[0] as MinterSymbolNode, children[1])
	case TokenType.Variable:
		return new MinterSymbolNode(token.lexeme)
	case TokenType.Number:
		// convert string lexeme to number if posssible
		const constant = Number(token.lexeme)
		return new MinterConstantNode(constant)
	case TokenType.Pi:
		return new MinterSymbolNode('pi')
	case TokenType.E:
		return new MinterSymbolNode('e')
	default:
		throw new ParseError('unknown token type', token)
	}
}

// Maps each left grouping token to its corresponding right grouping token
export const rightGrouping: { [key in TokenType]?: TokenType } = {
	[TokenType.Lparen]: TokenType.Rparen,
	[TokenType.Lbrace]: TokenType.Rbrace,
	[TokenType.Left]: TokenType.Right,
	[TokenType.Bar]: TokenType.Bar
}

// Token types that are primaries or denote the start of a primary
export const primaryTypes = [
	TokenType.Left,
	TokenType.Lparen,
	TokenType.Lbrace,
	TokenType.Bar,
	TokenType.Number,
	TokenType.Variable,
	TokenType.Frac,
	TokenType.Sqrt,
	TokenType.Sin,
	TokenType.Cos,
	TokenType.Tan,
	TokenType.Csc,
	TokenType.Sec,
	TokenType.Cot,
	TokenType.Arcsin,
	TokenType.Arccos,
	TokenType.Arctan,
	TokenType.Sinh,
	TokenType.Cosh,
	TokenType.Tanh,
	TokenType.Log,
	TokenType.Ln,
	TokenType.Det,
	TokenType.Pi,
	TokenType.E,
	TokenType.Begin,
	TokenType.Opname
]
