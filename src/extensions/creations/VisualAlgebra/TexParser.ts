
import { SentenceTree } from './SentenceTypes'

const enum TokenType {
	Number,
	Variable,
	Equals,
	Plus,
	Minus,
	Star,
	Times,
	Slash,
	Caret,
	Comma,
	Lbrace,
	Rbrace,
	Lparen,
	Rparen,
	Bar,
	Amp,
	Dblbackslash,
	Sqrt,
	Frac,
	Sin,
	Cos,
	Tan,
	Csc,
	Sec,
	Cot,
	Arcsin,
	Arccos,
	Arctan,
	Sinh,
	Cosh,
	Tanh,
	Log,
	Ln,
	Pi,
	E,
	Begin,
	End,
	Matrix,
	Left,
	Right,
	Eof,
	T,
	Det,
	Opname,
	Eigenvalues,
	Eigenvectors,
	Cross,
	Proj,
	Comp,
	Norm,
	Inv,
	Space, // ignored by the lexer
}

const lexemeToType: { [key: string]: TokenType } = {
	'=': TokenType.Equals,
	'+': TokenType.Plus,
	'-': TokenType.Minus,
	'*': TokenType.Star,
	'\\cdot': TokenType.Star,
	'\\times': TokenType.Times,
	'^': TokenType.Caret,
	'/': TokenType.Slash,
	',': TokenType.Comma,
	'{': TokenType.Lbrace,
	'}': TokenType.Rbrace,
	'(': TokenType.Lparen,
	')': TokenType.Rparen,
	'|': TokenType.Bar,
	'&': TokenType.Amp,
	bmatrix: TokenType.Matrix,
	'\\\\': TokenType.Dblbackslash,
	'\\sqrt': TokenType.Sqrt,
	'\\frac': TokenType.Frac,
	'\\sin': TokenType.Sin,
	'\\cos': TokenType.Cos,
	'\\tan': TokenType.Tan,
	'\\csc': TokenType.Csc,
	'\\sec': TokenType.Sec,
	'\\cot': TokenType.Cot,
	'\\arcsin': TokenType.Arcsin,
	'\\arccos': TokenType.Arccos,
	'\\arctan': TokenType.Arctan,
	'\\sinh': TokenType.Sinh,
	'\\cosh': TokenType.Cosh,
	'\\tanh': TokenType.Tanh,
	'\\log': TokenType.Log,
	'\\ln': TokenType.Ln,
	'\\pi': TokenType.Pi,
	e: TokenType.E,
	'\\begin': TokenType.Begin,
	'\\end': TokenType.End,
	'\\left': TokenType.Left,
	'\\right': TokenType.Right,
	T: TokenType.T,
	'\\det': TokenType.Det,
	'\\operatorname': TokenType.Opname,
	eigenvectors: TokenType.Eigenvectors,
	eigenvalues: TokenType.Eigenvalues,
	cross: TokenType.Cross,
	proj: TokenType.Proj,
	comp: TokenType.Comp,
	norm: TokenType.Norm,
	inv: TokenType.Inv,
}

/**
* A mapping from a token type to the operation it represents.
* The operation is the name of a function in the mathjs namespace,
* or of a function to be defined in scope (i.e. in the argument to math.evaluate())
*/
const typeToOperation: { [key in TokenType]?: string } = {
	[TokenType.Plus]: 'add',
	[TokenType.Minus]: 'subtract',
	[TokenType.Star]: 'multiply',
	[TokenType.Times]: 'multiply',
	[TokenType.Caret]: 'pow',
	[TokenType.Slash]: 'divide',
	[TokenType.Frac]: 'divide',
	[TokenType.Bar]: 'abs',
	[TokenType.Sqrt]: '\\sqrt',
	[TokenType.Sin]: 'sin',
	[TokenType.Cos]: 'cos',
	[TokenType.Tan]: 'tan',
	[TokenType.Csc]: 'csc',
	[TokenType.Sec]: 'sec',
	[TokenType.Cot]: 'cot',
	[TokenType.Arcsin]: 'asin',
	[TokenType.Arccos]: 'acos',
	[TokenType.Arctan]: 'atan',
	[TokenType.Sinh]: 'sinh',
	[TokenType.Cosh]: 'cosh',
	[TokenType.Tanh]: 'tanh',
	[TokenType.Log]: 'log10',
	[TokenType.Ln]: 'log',
	[TokenType.Det]: 'det',
	[TokenType.Eigenvectors]: 'eigenvectors',
	[TokenType.Eigenvalues]: 'eigenvalues',
	[TokenType.Cross]: 'cross',
	[TokenType.Proj]: 'proj',
	[TokenType.Comp]: 'comp',
	[TokenType.Norm]: 'norm',
	[TokenType.Inv]: 'inv'
}


class Token {
	/**
	* A token in a TeX string.
	* @param {string} lexeme string literal of the token
	* @param {TokenType} type type of the token
	* @param {Number} pos position of the token in the input string
	**/
	lexeme: string
	type: TokenType
	pos: number

	/*
	* @constructor Token
	*/
	constructor(lexeme: string, type: TokenType, pos: number) {
		this.lexeme = lexeme
		this.type = type
		this.pos = pos
	}
}

class LexError extends Error {
	constructor(message: string, pos: number, ...args: any) {
		super(...args)
		this.name = 'LexError'
		this.message = `at ${pos}: ${message}`
	}
}

class Lexer {
	
	isWhitespace(c: string): boolean {
		return c.trim() === ''
	}

	isAlpha(c: string): boolean {
		return /^[A-Za-z]{1,1}$/.test(c)
	}

	isControl(c: string): boolean {
	  return /[^ -~]/.test(c)
	}

	isDigit(c: string): boolean {
		return c >= '0' && c <= '9'
	}

	// Returns the next word starting at pos in the string.
	// If the string begins with non-alphabetic characters at pos, returns an empty string.
	scanWord(str: string, pos: number): string {
		if (!this.isAlpha(str[pos])) {
			return ''
		}
		let end = pos
		// consume characters until a non-alphabetic character is encountered
		while (this.isAlpha(str[end])) {
			end += 1
		}
		return str.slice(pos, end)
	}

	// Returns the next number starting at pos in the string.
	// If the string begins with a non-digit at pos, returns an empty string.
	scanNumber(str: string, pos: number): string {
		if (!this.isDigit(str[pos])) {
			return ''
		}
		let end = pos + 1
		// consume characters until a non-digit is found
		while (this.isDigit(str[end])) {
		end += 1
		}
		if (str[end] === '.') {
			end += 1
			// decimal number
			while (this.isDigit(str[end])) {
				end += 1
			}
		}
		return str.slice(pos, end)
	}

	// Convert a TeX string to an array of tokens
	tokenizeTex(texStr: string): Array<Token> {
		var i = 0
		const { length } = texStr
		const tokens = []
		while (i < length) {
			// skip leading whitespace
			while (this.isWhitespace(texStr[i])) {
			i += 1
		}
		let lexeme = ''
		let type = TokenType.Eof
		const c = texStr[i]
		// don't accept control characters
		if (this.isControl(c)) {
			throw new LexError('invalid control sequence encountered ' + '(forgot to escape backslashes (\\begin => \\\\begin)?', i);
		}
		// scan for single-char non-alphabetical lexemes
		if (!this.isAlpha(c) && c in lexemeToType) {
			type = lexemeToType[c]
			lexeme = c
		} else if (c === '\\') {
			// scan for multi-char lexemes starting with \
			const nextChar = texStr[i + 1]
			if (nextChar === '\\') {
				// double backslash
				type = TokenType.Dblbackslash
				lexeme = '\\\\'
			} else if (nextChar === ' ') {
				// space character: ignore
				type = TokenType.Space
				lexeme = '\\ '
			} else {
				// TeX command
				const command = this.scanWord(texStr, i + 1);
				if (command === undefined) {
					// an alpha char must immediately follow the backslash
					// or the command is malformed
					throw new LexError('expected command '
					            + '(a non-alphabetic character was encountered)', i)
				} else {
					lexeme = `\\${command}`
					type = lexemeToType[lexeme]
					if (type === undefined) {
						throw new LexError(`unknown command "${lexeme}"`, i)
					}
				}
			}
		} else if (this.isDigit(c)) {
			// scan for numbers
			// the position i passed to scanNumber includes the current digit character
			// because the first character is part of the number
			lexeme = this.scanNumber(texStr, i)
			type = TokenType.Number
		} else if (this.isAlpha(c)) {
			// scan for identifiers
			const identifier = this.scanWord(texStr, i)
			if (identifier in lexemeToType) {
				// identifier is a "keyword" (e.g. matrix)
				lexeme = identifier
				type = lexemeToType[identifier]
			} else {
				// unrecognized alphabetical lexeme: treat as variable
				lexeme = identifier
				type = TokenType.Variable
			}
		} else {
			throw new LexError(`unrecognized character "${c}"`, i)
		}
		// ignore space characters
		if (type !== TokenType.Space) {
			tokens.push(new Token(lexeme, type, i))
		}
		i += lexeme.length
	}
	tokens.push(new Token('EOF', TokenType.Eof, i))
		return tokens
	}


}



// Maps each left grouping token to its corresponding right grouping token
const rightGrouping: { [key in TokenType]?: TokenType } = {
	[TokenType.Lparen]: TokenType.Rparen,
	[TokenType.Lbrace]: TokenType.Rbrace,
	[TokenType.Left]: TokenType.Right,
	[TokenType.Bar]: TokenType.Bar
}

// Token types that are primaries or denote the start of a primary
const primaryTypes = [
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

class ParseError extends Error {
	constructor(message: string, token: Token, ...args: Array<any>) {
		super(...args)
		this.name = 'ParseError'
		this.message = `${token.lexeme} at ${token.pos}: ${message}`
	}
}

class MathNode {
	globals: object
	constructor() {
		this.globals = {}
	}
	value(scope: object = {}): number {
		return NaN
	}

	variables(): Array<string> {
		return []
	}

	toSentenceTree(): SentenceTree {
		return ['', []]
	}
	tex(): string {
		return ''
	}
}

class SymbolNode extends MathNode {
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
			return scope['e'] ?? this.globals['e'] ?? Math.E
		default:
			return scope[this.name] ?? this.globals[this.name] ?? NaN
		}
	}

	variables(): Array<string> {
		if (['tau', 'pi', 'e'].includes(this.name)) {
			return []
		}
		return [this.name]
	}

	toSentenceTree(): SentenceTree {
		return [this.name, []]
	}
	tex(): string {
		return this.name
	}
}

class ConstantNode extends MathNode {
	_value: number
	constructor(value: number) {
		super()
		this._value = value
	}
	value(scope: object = {}): number {
		return this._value
	}
	toSentenceTree(): SentenceTree {
		return [`${this._value}`, []]
	}
	tex(): string {
		return this._value.toString()
	}
}

class AssignmentNode extends MathNode {
	symbol: SymbolNode
	child: MathNode
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
	toSentenceTree(): SentenceTree {
		return ['=', [this.symbol.toSentenceTree(), this.child.toSentenceTree()]]
	}
	tex(): string {
		return `${this.name} = ${this.child}`;
	}
}

class FunctionNode extends MathNode {
	name: string
	child: MathNode

	constructor(name: string, child: MathNode) {
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
	toSentenceTree(): SentenceTree {
		return [this.name, [this.child.toSentenceTree()]]
	}
	tex(): string {
		return `\\${this.name}(${this.child})`;
	}
}

class OperatorNode extends MathNode {
	name: string
	children: Array<MathNode>

	constructor(name: string, children: Array<MathNode>) {
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
		case '\\cdot':
			return a * b
		case '/':
			return a / b
		case '^':
			return a ** b
		case '=':
			return (a == b) ? 1 : 0
		case '<':
			return (a < b) ? 1 : 0
		case '>':
			return (a > b) ? 1 : 0
		case '<=':
			return (a <= b) ? 1 : 0
		case '>=':
			return (a >= b) ? 1 : 0
		case '!=':
			return (a != b) ? 1 : 0
		default:
			return NaN
		}
	}
	toSentenceTree(): SentenceTree {
		return [this.name, this.children.map((node) => node.toSentenceTree())]
	}

	tex(): string {
		return `(${this.children[0]} ${this.name} ${this.children[1]})`;
	}
}

class ComparisonNode extends OperatorNode {
	declare name: '=' | '<' | '>' | '<=' | '>=' | '!='
}

class EquationNode extends ComparisonNode {
	declare name: '='
	constructor(children: Array<MathNode>) {
		super('=', children)
	}
}


/**
* Create the corresponding MathJS node of a Token and its children.
* @returns A newly constructed MathJS node.
*/
function createMathNode(token: Token, children: Array<MathNode> = []): MathNode {
	let fn = typeToOperation[token.type]
	switch (token.type) {
	case TokenType.Minus:
		// mathjs differentiates between subtraction and the unary minus
		fn = children.length === 1 ? 'unaryMinus' : fn
		// falls through
	case TokenType.Plus:
		return new OperatorNode((token.type == TokenType.Plus) ? '+' : '-', children)
	case TokenType.Star:
		return new OperatorNode('\\cdot', children)
	case TokenType.Frac:
	case TokenType.Slash:
		return new OperatorNode('\\frac', children)
	case TokenType.Caret:
		if (children.length < 2) {
			throw new ParseError('Expected two children for ^ operator', token)
		}
		return new OperatorNode('^', children)
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
		return new FunctionNode(fn, children[0])
	case TokenType.Equals:
		return new AssignmentNode(children[0] as SymbolNode, children[1])
	case TokenType.Variable:
		return new SymbolNode(token.lexeme)
	case TokenType.Number:
		// convert string lexeme to number if posssible
		const constant = Number(token.lexeme)
		return new ConstantNode(constant)
	case TokenType.Pi:
		return new SymbolNode('\\pi')
	case TokenType.E:
		return new SymbolNode('e')
	default:
		throw new ParseError('unknown token type', token)
	}
}

export class TexParser {
	lexer: Lexer
	tokens: Array<Token>
	pos: number

	/**
	* A recursive descent parser for TeX math. The following context-free grammar is used:
	*
	* expr = term ((PLUS | MINUS) term)*
	* 	| VARIABLE EQUALS expr
	*
	* term = factor ((STAR factor | primary))* //primary and factor must both not be numbers
	*
	* factor = MINUS? power
	*
	* power = primary (CARET primary)*
	*
	* primary = grouping
	* 	| environnment
	* 	| frac
	* 	| function
	* 	| NUMBER
	* 	| VARIABLE
	*
	* grouping = LEFT LPAREN expr RIGHT RPAREN
	* 	| LPAREN expr RPAREN
	* 	| LBRACE expr RBRACE
	* 	| LEFT BAR expr RIGHT BAR
	* 	| BAR expr BAR
	*
	* environnment = matrix
	*
	* frac = FRAC LBRACE expr RBRACE LBRACE expr RBRACE
	*
	* matrix = BEGIN LBRACE MATRIX RBRACE ((expr)(AMP | DBLBACKSLASH))* END LBRACE MATRIX RBRACE
	*
	* function = (SQRT | SIN | COS | TAN | ...) argument
	* 	| OPNAME LBRACE customfunc RBRACE argument
	*
	* argument = grouping
	* 	| expr
	*
	* In general, each production is represented by one method (e.g. nextFactor(), nextPower()...)
	*
	* @param tokens A list of Tokens to be parsed.
	*/
	constructor(tokens: Array<Token> = []) {
		this.lexer = new Lexer()
		this.tokens = tokens
		this.pos = 0
	}

	/**
	* Get the type that the current token matches.
	* @param types A variable number of token types to match the current token
	* with.
	* @returns Returns the matched token type if there is a match.
	*Otherwise returns undefined.
	*/
	match(...types: Array<TokenType>): TokenType | undefined {
		const { type } = this.tokens[this.pos]
		return (types.indexOf(type) !== -1) ? type : undefined
	}

	/**
	* Get the next token and advance the position in the token stream.
	* @returns Returns the next token in the token stream.
	*/
	nextToken(): Token {
		return this.tokens[this.pos++]
	}

	/**
	* Get the current token in the token stream without consuming it.
	* @returns Returns the current token in the token stream.
	*/
	currentToken(): Token {
		return this.tokens[this.pos]
	}

	/**
	* Get the previous token in the token stream. Returns undefined
	* if the position is at the beginning of the stream.
	* @returns Returns the previous token in the token stream.
	*/
	previousToken(): Token {
		return this.tokens[this.pos - 1]
	}

	/**
	* Consume the next expression in the token stream according to the following production:
	*
	* expr => term ((PLUS | MINUS) term)*
	*|	VARIABLE EQUALS expr
	* @returns Returns the root node of an expression tree.
	*/
	nextExpression(): any {
		let leftTerm = this.nextTerm()
		// VARIABLE EQUALS expr
		if (this.match(TokenType.Equals)) {
			if ('isSymbolNode' in leftTerm && !leftTerm.isSymbolNode) {
				throw new ParseError(
					'expected variable (SymbolNode) on left hand of assignment',
					this.previousToken()
				)
			}
			const equals = this.nextToken()
			const rightExpr = this.nextExpression()
			return createMathNode(equals, [leftTerm, rightExpr])
		}
		// term ((PLUS | MINUS) term)*

		while (this.match(TokenType.Plus, TokenType.Minus)) {
			// build the tree with left-associativity
			const operator = this.nextToken()
			const rightTerm = this.nextTerm()
			leftTerm = createMathNode(operator, [leftTerm, rightTerm])
		}
		return leftTerm
	}

	/**
	* Consume the next term according to the following production:
	*
	* term => factor (((STAR | TIMES) factor) | power)*
	* @returns Returns the root node of an expression tree.
	*/
	nextTerm(): any {
		function isNumberNode(node: any) {
			return 'isConstantNode' in node && node.isConstantNode && !Number.isNaN(Number(node))
		}
		let leftFactor = this.nextFactor()
		let implicitMult = false;
		// since bmatrix is the only environnment supported, it suffices to only have
		// one token lookahead and assume that \begin is the start of a matrix.
		// However, if more environnment support is added, it would be necessary to
		// have more lookahead and ensure that the matrix begins with BEGIN LBRACE MATRIX.
		for (;;) {
			const lookaheadType = this.match(
				TokenType.Star,
				TokenType.Times,
				TokenType.Slash,
				...primaryTypes,
			)
			if (lookaheadType === undefined) {
				break
			}
			let operator
			let rightFactor
			// multiplication between two adjacent factors is implicit as long as
			// they are not both numbers
			if (isNumberNode(leftFactor) && lookaheadType === TokenType.Number) {
				throw new ParseError('multiplication is not implicit between two different' + 'numbers: expected * or \\cdot', this.currentToken())
			} else if (this.match(TokenType.Star, TokenType.Times, TokenType.Slash)) {
				operator = this.nextToken()
				rightFactor = this.nextFactor()
			} else {
				const starPos = this.pos
				// implicit multiplication is only vaild if the right factor is not negated
				// (2x != 2-x), so we parse a power instead of a factor
				rightFactor = this.nextPower()
				// multiplication is implicit: a multiplication (star) token needs to be created
				operator = new Token('*', TokenType.Star, starPos)
				implicitMult = true
			}
			leftFactor = createMathNode(operator, [leftFactor, rightFactor])
			leftFactor.implicit = implicitMult
		}
		return leftFactor
	}

	/**
	* Consume the next factor according to the following production:
	*
	* factor => MINUS? power
	* @returns The root node of an expression tree.
	*/
	nextFactor(): any {
		// match for optional factor negation
		if (this.match(TokenType.Minus)) {
			const negate = this.nextToken()
			const primary = this.nextPower()
			return createMathNode(negate, [primary])
		}
		return this.nextPower()
	}

	/**
	* Consume the next power according to the following production:
	*
	* power => primary (CARET primary)*
	* @returns The root node of an expression tree.
	*/
	nextPower(): any {
		let base = this.nextPrimary()
		while (this.match(TokenType.Caret)) {
			const caret = this.nextToken()
			const exponent = this.nextPrimary()
			base = createMathNode(caret, [base, exponent])
		}
		return base
	}

	/**
	* Try to consume a token of the given type. If the next token does not match,
	* an error is thrown.
	* @param errMsg Error message associated with the error if the match fails.
	* @param tokenTypes A variable amount of token types to match.
	* @returns Returns the consumed token on successful match.
	*/
	tryConsume(errMsg: string, ...tokenTypes: Array<TokenType>): Token {
		const lookaheadType = this.match(...tokenTypes)
		if (lookaheadType === undefined) {
			throw new ParseError(errMsg, this.currentToken())
		}
		return this.nextToken()
	}

	/**
	* Consume the next primary according to the following production:
	*
	* primary => grouping
	* 	| environnment
	* 	| frac
	* 	| function
	* 	| NUMBER
	* 	| VARIABLE
	*
	* @returns The root node of an expression tree.
	*/
	nextPrimary(): any {
		const lookaheadType = this.match(...primaryTypes);
		if (lookaheadType === undefined) {
			throw new ParseError('expected primary', this.currentToken())
		}
		let primary
		switch (lookaheadType) {
		case TokenType.Left:
		case TokenType.Lparen:
		case TokenType.Lbrace:
		case TokenType.Bar:
			// nextGrouping can return an array of children
			// (if the grouping contains comma-seperated values, e.g. for a multi-value function),
			// so for a primary, we only take the first value (or if there is just one, the only value)
			[primary] = this.nextGrouping()
			break
		case TokenType.Number:
		case TokenType.Variable:
		case TokenType.Pi:
		case TokenType.E:
		case TokenType.T:
			primary = createMathNode(this.nextToken())
			break
		case TokenType.Sqrt:
		case TokenType.Sin:
		case TokenType.Cos:
		case TokenType.Tan:
		case TokenType.Csc:
		case TokenType.Sec:
		case TokenType.Cot:
		case TokenType.Arcsin:
		case TokenType.Arccos:
		case TokenType.Arctan:
		case TokenType.Sinh:
		case TokenType.Cosh:
		case TokenType.Tanh:
		case TokenType.Log:
		case TokenType.Ln:
		case TokenType.Det:
			primary = this.nextUnaryFunc()
			break
		case TokenType.Opname:
			primary = this.nextCustomFunc()
			break
		case TokenType.Frac:
			primary = this.nextFrac()
			break
		case TokenType.Begin:
			// matrix is the only currently supported environment: if more are added, another
			// token of lookahead would be required to know which environment to parse
			primary = this.nextMatrix()
			break
		default:
			throw new ParseError('unknown token encountered during parsing', this.nextToken())
		}
		return primary
	}

	/**
	* Consume the next grouping according to the following production:
	*
	* grouping = LEFT LPAREN expr RIGHT RPAREN
	* 	| LPAREN expr RPAREN
	* 	| LBRACE expr RBRACE
	* 	| LEFT BAR expr RIGHT BAR
	* 	| BAR expr BAR
	* 	| expr
	*
	* @returns The root node of an expression tree.
	*/
	nextGrouping(): Array<any> {
		// token indicating start of grouping
		let leftRight = false // flag indicating if grouping tokens are marked with \left and \right
		if (this.match(TokenType.Left)) {
			leftRight = true
			this.nextToken() // consume \left
		}
		const leftGrouping = this.tryConsume(
			"expected '(', '|', '{'",
			TokenType.Lparen,
			TokenType.Bar,
			TokenType.Lbrace
		)
		let grouping = this.nextExpression()
		if (leftGrouping.type === TokenType.Bar) {
			// grouping with bars |x| also applies a function, so we create the corresponding function
			// here
			grouping = createMathNode(leftGrouping, [grouping])
		}
		// a grouping can contain multiple children if the
		// grouping is parenthetical and the values are comma-seperated
		const children: any[] = [grouping]
		if (leftGrouping.type === TokenType.Lparen) {
			while (this.match(TokenType.Comma)) {
				this.nextToken(); // consume comma
				children.push(this.nextExpression())
			}
		}
		if (leftRight) {
			this.tryConsume('expected \\right to match corresponding \\left after expression',
			TokenType.Right)
		}
		// look for corresponding right grouping
		this.tryConsumeRightGrouping(leftGrouping)
		return children
	}

	/**
	* Consume the next token corresponding to a built-in MathJS function.
	*
	* @returns The root node of an expression tree.
	*/
	nextUnaryFunc(): any {
		const func = this.nextToken()
		const argument = this.nextArgument()
		return createMathNode(func, argument)
	}

	/**
	* Consume the next token corresponding to a user-defined function.
	*
	* customFn => OPNAME LBRACE identifier RBRACE grouping
	* @returns The root node of an expression tree.
	*/
	nextCustomFunc(): any {
		this.nextToken() // consume \\operatornmae
		this.tryConsume("expected '{' after \\operatorname", TokenType.Lbrace)
		const customFunc = this.nextToken()
		this.tryConsume("expected '}' after operator name", TokenType.Rbrace)
		const argument = this.nextArgument()
		return createMathNode(customFunc, argument)
	}

	/**
	* Consume the next group of arguments according to the following production:
	*
	* argument => grouping
	* 	| expr
	*
	* @returns The root node of an expression tree.
	*/
	nextArgument(): Array<any> {
		let argument
		// try to match grouping e.g. (), {}, ||
		if (this.match(
			TokenType.Left,
			TokenType.Lparen,
			TokenType.Lbrace,
			TokenType.Bar
		)) {
			// grouping around argument e.g. \sin (x)
			argument = this.nextGrouping()
		} else {
			// no grouping e.g. \sin x; consume the next token as the argument
			argument = [this.nextPrimary()]
		}
		return argument
	}

	/**
	* Consume the next fraction according to the following production:
	*
	* frac => FRAC LBRACE expr RBRACE LBRACE expr RBRACE
	*
	* @returns The root node of an expression tree.
	*/
	nextFrac(): any {
		const frac = this.nextToken()
		this.tryConsume("expected '{' for the numerator in \\frac", TokenType.Lbrace)
		const numerator = this.nextExpression()
		this.tryConsume("expected '}' for the numerator in \\frac", TokenType.Rbrace)
		let denominator
		// {} is optional for the denominator of \frac
		if (this.match(TokenType.Lbrace)) {
			this.nextToken()
			denominator = this.nextExpression()
			this.tryConsume("expected '}' for the denominator in \\frac", TokenType.Rbrace)
		} else {
			denominator = this.nextExpression()
		}
		return createMathNode(frac, [numerator, denominator])
	}

	/**
	* Consume the next matrix environnment according to the following production:
	*
	* matrix => BEGIN LBRACE MATRIX RBRACE ((expr)(AMP | DBLBACKSLASH))* END LBRACE MATRIX RBRACE
	*
	* @returns The root node of an expression tree.
	*/
	nextMatrix(): any {
		this.nextToken() // consume \begin
		this.tryConsume("expected '{' after \\begin", TokenType.Lbrace)
		const matrixToken = this.tryConsume("expected 'matrix' after '\\begin{' "
			+ '(no other environments'
			+ 'are supported yet)', TokenType.Matrix)
		this.tryConsume("expected '}' after \\begin{matrix", TokenType.Rbrace)
		let row = []
		const rows = []
		// parse matrix elements
		for (;;) {
			const element = this.nextExpression()
			// '&' delimits columns; append 1 element to this row
			if (this.match(TokenType.Amp)) {
				this.nextToken()
				row.push(element)
			} else if (this.match(TokenType.Dblbackslash, TokenType.End) !== undefined) {
				// '\\' delimits rows; add a new row
				const delimiter = this.nextToken()
				row.push(element)
				if (row.length === 1) {
					rows.push(element)
				} else {
					rows.push(createMathNode(matrixToken, row))
				}
				row = []
				if (delimiter.type === TokenType.End) {
					break
				}
			} else if (this.match(TokenType.Eof)) {
				throw new ParseError('unexpected EOF encountered while parsing matrix',
				this.currentToken())
			} else {
				throw new ParseError('unexpected delimiter while parsing matrix',
				this.currentToken())
			}
		}
		this.tryConsume("expected '{' after \\end", TokenType.Lbrace)
		this.tryConsume("expected 'matrix' after '\\end{' (no other environnments"
		+ 'are supported yet)', TokenType.Matrix)
		this.tryConsume("expected '}' after \\end{matrix", TokenType.Rbrace)
		return createMathNode(matrixToken, rows)
	}

	/**
	* Try to consume the right grouping token corresponding to the given left grouping token.
	* e.g. '(' => ')', '{' => '}'. If the token doesn't match, an error is thrown.
	*
	* @param leftGroupingToken A left grouping token.
	*
	*/
	// Try to consume a right grouping character given the corresponding left grouping token
	// e.g. RPAREN for LPAREN, BAR for BAR
	tryConsumeRightGrouping(leftGroupingToken: Token) {
		const rightGroupingType = rightGrouping[leftGroupingToken.type]
		// get any tokens that match with the required token type
		const expectedLexemes = Object.keys(lexemeToType)
			.filter((key) => lexemeToType[key] === rightGroupingType)
			// insert quotes (e.g. { => '{')
			.map((lexeme) => `'${lexeme}'`)
		const errMsg = `expected ${expectedLexemes.join(' or ')} to match corresponding '${leftGroupingToken.lexeme}'`
		this.tryConsume(errMsg, rightGrouping[leftGroupingToken.type]!)
	}

	/**
	* Parse an array of TeX math tokens as a MathJS expression tree.
	*
	* @param tokens An array of tokens to parse.
	*
	* @returns The root node of a MathJS expression tree.
	*/
	parseTokens(tokens: Array<Token>): MathNode {
		//return this.nextExpression() as MathNode
		return (new TexParser(tokens)).nextExpression()
	}

	/**
	 * Parse a TeX math string into a MathJS expression tree.
	 * @returns Returns an object containing the root node of a MathJS expression tree
	 *          and variables that need to be defined.
	 */
	parseTex(texStr: string): MathNode {
	  return this.parseTokens(this.lexer.tokenizeTex(texStr))
	}

}