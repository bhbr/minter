
import { tokenizeTeXString, isLetter, isNumber } from './MinterLexer'
import { MinterMathNode, MinterNumberNode, MinterVariableNode } from './MinterMathNode'
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
		}
	}

	return null

}


export function parseTeX(texString: string): MinterMathNode {
	return parseTokens(tokenizeTeXString(texString))
}



