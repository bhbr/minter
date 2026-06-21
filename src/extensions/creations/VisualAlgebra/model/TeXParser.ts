
import { TeXLexer } from './TeXLexer'
import { SentenceTree } from './SentenceTypes'

export class TeXParser {

	static closingParens = {
		'(': ')', '[': ']', '{': '}', '\\{': '\\}'
	}

	static openParens = Object.keys(TeXParser.closingParens)

	static isOpenParen(token: string): boolean {
		return TeXParser.openParens.includes(token)
	}

	static closingParenIndex(tokens: Array<string>, parenType?: string): number {
		if (tokens.length == 0) {
			return 0
		}
		let openParen = parenType ?? tokens[0]
		if (!TeXParser.isOpenParen(openParen)) {
			return 0
		}
		let closeParen = TeXParser.closingParens[openParen]
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

	static leadingTokenGroup(tokens: Array<string>, parenType?: string): Array<string> {
		let i = TeXParser.closingParenIndex(tokens, parenType)
		return tokens.slice(0, i + 1)
	}

	static popLeadingTokenGroup(tokens: Array<string>, parenType?: string): Array<string> {
		let i = TeXParser.closingParenIndex(tokens, parenType)
		return tokens.slice(i + 1)
	}

	static isGroup(tokens: Array<string>, parenType?: string): boolean {
		return TeXParser.popLeadingTokenGroup(tokens, parenType).length == 0
	}

	static precedence = {
		'+': 0,
		'-': 0,
		'\\cdot': 1,
		'*': 1,
		'/': 1,
		'^': 2
	}

	static operators = Object.keys(TeXParser.precedence)

	static isOperator(token: string): boolean {
		return TeXParser.operators.includes(token)
	}

	static outermostOperatorsByIndex(tokens: Array<string>): Record<string, string> {
		if (tokens.length == 0) {
			return {}
		}
		let allOuterOperatorsByIndex: Record<string, string> = {}
		let leftGroup = TeXParser.leadingTokenGroup(tokens)
		let rest = TeXParser.popLeadingTokenGroup(tokens)
		if (TeXParser.isOperator(rest[0])) {
			allOuterOperatorsByIndex[`${leftGroup.length}`] = rest[0]
			let newOps = TeXParser.outermostOperatorsByIndex(rest.slice(1))
			for (let [index, op] of Object.entries(newOps)) {
				allOuterOperatorsByIndex[`${leftGroup.length + Number(index) + 1}`] = op
			}
		}
		return allOuterOperatorsByIndex
	}

	static outermostOperatorIndex(tokens: Array<string>): number {
		let allOps = TeXParser.outermostOperatorsByIndex(tokens)
		let indices = Object.keys(allOps).map((x) => Number(x)).sort().reverse().map((x) => `${x}`)
		var op: string | null = null
		var index: number = NaN
		for (let i of indices) {
			if (op == null) {
				op = allOps[i]
				index = Number(i)
				continue
			}
			if (TeXParser.precedence[allOps[i]] <= TeXParser.precedence[op]) {
				op = allOps[i]
				index = Number(i)
			}
		}
		return index
	}

	static sentenceToTree(sentence: Array<string>): SentenceTree | null {

		if (sentence.length == 1) {
			let token = sentence[0]
			if (TeXLexer.isNumber(token)) {
				return [token, []]
			} else if (TeXLexer.isLetter(token)) {
				return [token, []]
			} else {
				return null
			}
		} else {
			let i = TeXParser.outermostOperatorIndex(sentence)
			if (isNaN(i)) {

				// if cannot be split into infix groups
				let firstToken = sentence[0]
				if (TeXLexer.isFunctionToken(firstToken)) {
					let remainingTokens = sentence.slice(1)
					let childNode = TeXParser.sentenceToTree(remainingTokens)
					if (childNode == null) {
						return null
					}
					return [firstToken, [childNode]]
				} else if (TeXParser.isGroup(sentence)) {
					return [sentence[0], [TeXParser.sentenceToTree(sentence.slice(1, sentence.length - 1))]]
				} else if (firstToken == '\\frac') {
					let remainingTokens = sentence.slice(1)
					let numeratorGroup = TeXParser.leadingTokenGroup(remainingTokens, '{')
					let denominatorGroup = TeXParser.popLeadingTokenGroup(remainingTokens, '{')
					if (!TeXParser.isGroup(numeratorGroup) || !TeXParser.isGroup(denominatorGroup)) {
						return null
					}
					return ['\\frac', [
						TeXParser.sentenceToTree(numeratorGroup),
						TeXParser.sentenceToTree(denominatorGroup)
					]]
				}

			} else {

				let leftGroup = sentence.slice(0, i)
				let operator = sentence[i]
				let rightGroup = sentence.slice(i + 1)
				let child1 = TeXParser.sentenceToTree(leftGroup)
				let child2 = TeXParser.sentenceToTree(rightGroup)
				return [operator, [
					child1,
					child2
				]]
			}
		}
		return null

	}

	static texToTree(texString: string): SentenceTree {
		return TeXParser.sentenceToTree(TeXLexer.texToSentence(texString.replace('\\cdot', '*')))
	}

}
