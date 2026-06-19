
import { log } from 'core/functions/logging'
import { tokenizeTeXString, isLetter, isNumber, isFunctionToken } from './MinterLexer'
import { MinterMathNode, MinterNumberNode, MinterVariableNode, MinterFunctionNode, MinterGroupNode } from './MinterMathNode'
// import { Sentence, SentenceForm, NonterminalSymbol } from 'extensions/creations/VisualAlgebra/SentenceTypes'
// import { concat } from 'core/functions/arrays'


// export function matchTokensToForm(tokens: Array<string>, form: Array<string>): Record<string, Array<string>> | null {
// 	if (form.length == 1) {
// 		if (tokens.length == 1 && (isLetter(tokens[0]) || isNumber(tokens[0]))) {
// 			let obj = {}
// 			obj[form[0]] = [tokens[0]]
// 			return obj
// 		} else {
// 			return null
// 		}
// 	} else if (form.length == 2) {
// 		if (form[0] == '<command>') {
// 			let obj = {}
// 			obj[form[0]] = [tokens[0]]
// 			obj[form[1]] = tokens.slice(1, tokens.length)
// 			return obj
// 		} else {
// 			return null
// 		}
// 	} else if (tokens[0] == '(') {
// 		if (form.length == 3 && form[0] == '(' && tokens[tokens.length - 1] == ')' && form[2] == ')') {
// 			let obj = {}
// 			obj[form[1]] = tokens.slice(1, tokens.length - 1)
// 			return obj
// 		} else {
// 			return null
// 		}
// 	} else if (tokens[0] == '[') {
// 		if (form.length == 3 && form[0] == '[' && tokens[tokens.length - 1] == ']' && form[2] == ']') {
// 			let obj = {}
// 			obj[form[1]] = tokens.slice(1, tokens.length - 1)
// 			return obj
// 		} else {
// 			return null
// 		}
// 	} else if (tokens[0] == '{') {
// 		if (form.length == 3 && form[0] == '{' && tokens[tokens.length - 1] == '}' && form[2] == '}') {
// 			let obj = {}
// 			obj[form[1]] = tokens.slice(1, tokens.length - 1)
// 			return obj
// 		} else {
// 			return null
// 		}
// 	} else if (tokens[0] == '\\frac') {
// 		if (form.length == 3) {
// 			// find the cutoff
// 			var openCount = 0
// 			for (let i = 1; i < tokens.length; i++) {
// 				let token = tokens[i]
// 				if (token == '{') {
// 					openCount += 1
// 				} else if (token == '}') {
// 					openCount -= 1
// 				}
// 				if (openCount == 0) {
// 					let numerator = tokens.slice(1, i)
// 					let denominator = tokens.slice(i, tokens.length)
// 					let obj = {}
// 					obj[form[1]] = numerator
// 					obj[form[2]] = denominator
// 					return obj
// 				}
// 			}
// 		} else {
// 			return null
// 		}
// 	} else if (form[1] == '<operator>') {
// 		if (form.length == 3) {
// 			for (let op of ['+', '-', '\\cdot', '/', '^']) {
// 				for (let i = 1; i < tokens.length; i++) {
// 					if (tokens[i] !== op) { continue }
// 					let leftParse = parseTokens(tokens.slice(0, i))
// 					let rightParse = parseTokens(tokens.slice(i + 1, tokens.length))
// 					if (leftParse == null || rightParse == null) { continue }
// 					let obj = {}
// 					obj[form[0]] = tokens.slice(0, i)
// 					obj[form[1]] = op
// 					obj[form[2]] = tokens.slice(i + 1, tokens.length)
// 					return obj
// 				}
// 			}
// 			return null
// 		} else {
// 			return null
// 		}
// 	}
// }

// export function parseTokens(tokens: Array<string> | null): Array<string> | null {
// 	if (tokens == null) {
// 		return null
// 	}
// 	var match = matchTokensToForm(tokens, ['<constant>'])
// 	if (match != null) {
// 		return match['<constant>']
// 	}
// 	match = matchTokensToForm(tokens, ['-', '<expr>'])
// 	if (match != null) {
// 		let p = parseTokens(match['<expr>'])
// 		if (p != null) {
// 			return concat(['opp'], p)
// 		} else {
// 			return null
// 		}
// 	}
// 	match = matchTokensToForm(tokens, ['\\frac', '<expr1>', '<expr2>'])
// 	if (match != null) {
// 		let p1 = parseTokens(match['<expr1>'])
// 		let p2 = parseTokens(match['<expr2>'])
// 		if (p1 != null && p2 != null) {
// 			return concat(concat(['\\frac'], p1), p2)
// 		} else {
// 			return null
// 		}
// 	}
// 	match = matchTokensToForm(tokens, ['<command>', '<expr>'])
// 	if (match != null) {
// 		let p = parseTokens(match['<expr>'])
// 		if (p != null) {
// 			return concat(match['<command>'], p)
// 		} else {
// 			return null
// 		}
// 	}
// 	match = matchTokensToForm(tokens, ['<expr1>', '<operator>', '<expr2>'])
// 	if (match != null) {
// 		let p1 = parseTokens(match['<expr1>'])
// 		let p2 = parseTokens(match['<expr2>'])
// 		if (p1 != null && p2 != null) {
// 			return concat(concat(match['<operator>'], p1), p2)
// 		} else {
// 			return null
// 		}
// 	}
// 	return null
// }

let closingParens = {
	'(': ')', '[': ']', '{': '}', '\\{': '\\}'
}

let openParens = Object.keys(closingParens)

export function isOpenParen(token: string): boolean {
	return openParens.includes(token)
}

export function closingParenIndex(tokens: Array<string>, parenType?: string): number {
	if (tokens.length == 0) {
		return 0
	}
	let openParen = parenType ?? tokens[0]
	if (!isOpenParen(openParen)) {
		return 0
	}
	let closeParen = closingParens[openParen]
	if (tokens[0] !== openParen) {
		return 0
	}
	var counter = 0
	for (let index = 0; index < tokens.length; index++) {
		let token = tokens[index]
		if (token == openParen) {
			counter++
		} else if (token == closeParen) {
			counter--
		}
		if (counter < 0) {
			return NaN
		} else if (counter == 0) {
			return index
		}
	}
	return NaN
}

export function leadingTokenGroup(tokens: Array<string>): Array<string> {
	let i = closingParenIndex(tokens)
	return tokens.slice(0, i + 1)
}

export function popLeadingTokenGroup(tokens: Array<string>): Array<string> {
	let i = closingParenIndex(tokens)
	return tokens.slice(i + 1)
}

export function isGroup(tokens: Array<string>): boolean {
	return popLeadingTokenGroup(tokens).length == 0
}

export function parseTokens(tokens: Array<string>): MinterMathNode | null {

	if (tokens.length == 1) {
		let token = tokens[0]
		if (isNumber(token)) {
			return new MinterNumberNode({
				value: Number(token)
			})
		} else if (isLetter(token)) {
			return new MinterVariableNode({
				name: token
			})
		} else {
			return null
		}
	} else {
		let firstToken = tokens[0]
		if (isFunctionToken(firstToken)) {
			let remainingTokens = tokens.slice(1)
			let childNode = parseTokens(remainingTokens)
			if (childNode == null) {
				return null
			}
			return new MinterFunctionNode({
				name: firstToken,
				child: childNode
			})
		} else if (isGroup(tokens)) {
			return new MinterGroupNode({
				parenType: tokens[0],
				child: parseTokens(tokens.slice(1, tokens.length - 1))
			})
		}
	}
	return null

}


export function parseTeX(texString: string): MinterMathNode {
	return parseTokens(tokenizeTeXString(texString))
}



