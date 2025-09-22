import { MathWrapper } from './customMath'
import { ParseError } from './ParseError'
import { Token, TokenType, typeToOperation, lexemeToType } from './Token'


/**
* Create the corresponding MathJS node of a Token and its children.
* @returns A newly constructed MathJS node.
*/
export function createMathJSNode(token: Token, children: Array<any> = []): any {
	let math = (new MathWrapper()).math
	let fn = typeToOperation[token.type]
	switch (token.type) {
	case TokenType.Times:
		return new (math as any).FunctionNode('cross', children)
	case TokenType.Minus:
		// mathjs differentiates between subtraction and the unary minus
		fn = children.length === 1 ? 'unaryMinus' : fn
		// falls through
	case TokenType.Plus:
	case TokenType.Star:
	case TokenType.Frac:
	case TokenType.Slash:
		return new (math as any).OperatorNode(token.lexeme, fn, children)
	case TokenType.Caret:
		if (children.length < 2) {
			throw new ParseError('Expected two children for ^ operator', token)
		}
		// manually check for ^T as the transpose operation
		if ('isSymbolNode' in children[1] && children[1].isSymbolNode && children[1].name === 'T') {
			return new (math as any).FunctionNode('transpose', [children[0]])
		}
		return new (math as any).OperatorNode(token.lexeme, fn, children)
	// mathjs built-in functions
	case TokenType.Bar:
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
	case TokenType.Eigenvalues:
	case TokenType.Eigenvectors:
	case TokenType.Det:
	case TokenType.Cross:
	case TokenType.Proj:
	case TokenType.Comp:
	case TokenType.Norm:
	case TokenType.Inv:
		return new (math as any).FunctionNode(fn, children)
	case TokenType.Equals:
		return new (math as any).AssignmentNode(children[0], children[1])
	case TokenType.Variable:
		return new (math as any).SymbolNode(token.lexeme)
	case TokenType.Number:
		// convert string lexeme to number if posssible
		const constant = Number.isNaN(Number(token.lexeme)) ? token.lexeme : +token.lexeme
		return new (math as any).ConstantNode(constant)
	case TokenType.Pi:
		return new (math as any).SymbolNode('pi')
	case TokenType.E:
		return new (math as any).SymbolNode('e')
	case TokenType.Matrix:
		return new (math as any).ArrayNode(children)
	case TokenType.T:
		return new (math as any).SymbolNode('T')
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
	TokenType.T, // e.g. [[1,2],[3,4]]^T
	TokenType.Opname
]
