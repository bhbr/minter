
import { ParseError } from './ParseError'
import { Token, TokenType, typeToOperation, lexemeToType } from './Token'
import { Lexer } from './Lexer'
import { createMinterMathNode, rightGrouping, primaryTypes } from './createMinterMathNode'

// scope used by evaluateTex to resolve identifiers
export type Scope = { [key: string]: any }

export class Parser {
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
	constructor(tokens: Array<Token>) {
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
			return createMinterMathNode(equals, [leftTerm, rightExpr])
		}
		// term ((PLUS | MINUS) term)*

		while (this.match(TokenType.Plus, TokenType.Minus)) {
			// build the tree with left-associativity
			const operator = this.nextToken()
			const rightTerm = this.nextTerm()
			leftTerm = createMinterMathNode(operator, [leftTerm, rightTerm])
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
			leftFactor = createMinterMathNode(operator, [leftFactor, rightFactor])
			(leftFactor as any).implicit = implicitMult
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
			return createMinterMathNode(negate, [primary])
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
			base = createMinterMathNode(caret, [base, exponent])
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
			primary = createMinterMathNode(this.nextToken())
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
			// matrix is the only currently supported environnment: if more are added, another
			// token of lookahead would be required to know which environnment to parse
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
			grouping = createMinterMathNode(leftGrouping, [grouping])
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
		return createMinterMathNode(func, argument)
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
		return createMinterMathNode(customFunc, argument)
	}

	/**
	* Consume the next group of arguments according to the following production:
	*
	* argument => grouping
	* | expr
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
		return createMinterMathNode(frac, [numerator, denominator])
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
			+ '(no other environnments'
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
					rows.push(createMinterMathNode(matrixToken, row))
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
		return createMinterMathNode(matrixToken, rows)
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
	parseTokens(tokens: Array<Token>): any {
		return (new Parser(tokens)).nextExpression()
	}

	/**
	 * Parse a TeX math string into a MathJS expression tree.
	 * @returns Returns an object containing the root node of a MathJS expression tree
	 *          and variables that need to be defined.
	 */
	parseTex(texStr: string): any {
	  return this.parseTokens(this.lexer.tokenizeTex(texStr))
	}

	/**
	 * Evaluate a TeX math string, returning the result as a MathJS MathType.
	 */
	evaluateTex(texStr: string, scope?: Scope): number {
		const root = this.parseTex(texStr)
		// @ts-ignore
	 	const value = root.value(scope)
	 	return value
	}

}

