
import { Parser } from './Parser'
import { AlgebraLexer } from './AlgebraLexer'
import { Sentence, SentenceTree, TerminalSymbol } from './SentenceTypes'
import { log } from 'core/functions/logging'
import { Algebra } from './Algebra'

export class AlgebraParser extends Parser {

	openParens: Array<string>
	closingParens: Record<string, string>
	precedence: Record<string, number>
	operators: Array<string>
	declare language: Algebra | null

	defaults(): object {
		return {
			language: null,
			openParens: [
				'(',
				'[',
				'{',
				'\\{'
			],
			closingParens: {
				'(': ')',
				'[': ']',
				'{': '}',
				'\\{': '\\}'
			},
			precedence: {
				'^': 3,
				'-': 2,
				'\\cdot': 2,
				'\\frac': 2,
				'+': 1,
				'=': 0,
			},
			operators: [
				'=',
				'+',
				'-',
				'\\cdot',
				'\\frac',
				'^'
			]
		}
	}
	
	isOpenParen(token: string): boolean {
		return this.openParens.includes(token)
	}

	closingParenIndex(tokens: Array<string>, parenType?: string): number {
		if (tokens.length == 0) {
			return 0
		}
		let openParen = parenType ?? tokens[0]
		if (!this.isOpenParen(openParen)) {
			return 0
		}
		let closingParen = this.closingParens[openParen]
		if (tokens[0] !== openParen) {
			return 0
		}
		var counter = 0
		for (let index = 0; index < tokens.length; index++) {
			let token = tokens[index]
			if (token == openParen) {
				counter++
			} else if (token == closingParen) {
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

	leadingTokenGroup(tokens: Array<string>, parenType?: string): Array<string> {
		let i = this.closingParenIndex(tokens, parenType)
		return tokens.slice(0, i + 1)
	}

	popLeadingTokenGroup(tokens: Array<string>, parenType?: string): Array<string> {
		let i = this.closingParenIndex(tokens, parenType)
		return tokens.slice(i + 1)
	}

	isGroup(tokens: Array<string>, parenType?: string): boolean {
		return this.popLeadingTokenGroup(tokens, parenType).length == 0
	}

	isOperator(token: string): boolean {
		return this.operators.includes(token)
	}

	outermostOperatorsByIndex(tokens: Array<string>): Record<string, string> {
		if (tokens.length == 0) {
			return {}
		}
		let allOuterOperatorsByIndex: Record<string, string> = {}
		let leftGroup = this.leadingTokenGroup(tokens)
		let rest = this.popLeadingTokenGroup(tokens)
		if (this.isOperator(rest[0])) {
			allOuterOperatorsByIndex[`${leftGroup.length}`] = rest[0]
			let newOps = this.outermostOperatorsByIndex(rest.slice(1))
			for (let [index, op] of Object.entries(newOps)) {
				allOuterOperatorsByIndex[`${leftGroup.length + Number(index) + 1}`] = op
			}
		}
		return allOuterOperatorsByIndex
	}

	outermostOperatorIndex(tokens: Array<string>): number {
		let allOps = this.outermostOperatorsByIndex(tokens)
		let indices = Object.keys(allOps).map((x) => Number(x)).sort().map((x) => `${x}`)
		var op: string | null = null
		var index: number = NaN
		for (let i of indices) {
			if (op == null) {
				op = allOps[i]
				index = Number(i)
				continue
			}
			if (this.precedence[allOps[i]] <= this.precedence[op]) {
				op = allOps[i]
				index = Number(i)
			}
		}
		return index
	}

	sentenceToTree(sentence: Sentence | null): SentenceTree | null {
		if (sentence === null) {
			return null
		}
		if (sentence.length == 1) {
			let token = sentence[0]
			if (this.language.lexer.isNumber(token)
				|| this.language.lexer.isLetter(token)) {
				let tree = [token as TerminalSymbol, [] as Array<SentenceTree>] as SentenceTree
				return tree
			} else {
				return null
			}
		} else {
			let i = this.outermostOperatorIndex(sentence)
			if (isNaN(i)) {

				// if sentence cannot be split into infix groups
				let firstToken = sentence[0]
				if (this.language.lexer.isFunctionToken(firstToken)) {
					let remainingTokens = sentence.slice(1)
					let childNode = this.sentenceToTree(remainingTokens)
					if (childNode == null) {
						return null
					}
					let tree = [firstToken, [childNode]] as SentenceTree
					return tree
				} else if (this.isGroup(sentence)) {
					return this.sentenceToTree(sentence.slice(1, sentence.length - 1))
				} else if (firstToken == '\\frac') {
					let remainingTokens = sentence.slice(1)
					let numeratorGroup = this.leadingTokenGroup(remainingTokens, '{')
					let denominatorGroup = this.popLeadingTokenGroup(remainingTokens, '{')
					if (!this.isGroup(numeratorGroup) || !this.isGroup(denominatorGroup)) {
						return null
					}
					let tree = ['\\frac', [
						this.sentenceToTree(numeratorGroup),
						this.sentenceToTree(denominatorGroup)
					]] as SentenceTree
					return tree
				}

			} else {

				let leftGroup = sentence.slice(0, i)
				let operator = sentence[i]
				let rightGroup = sentence.slice(i + 1)
				let child1 = this.sentenceToTree(leftGroup)
				let child2 = this.sentenceToTree(rightGroup)
				let tree = [operator, [
					child1,
					child2
				]] as SentenceTree
				return tree
			}
		}
		return null

	}

	stringToTree(texString: string): SentenceTree | null {
		let tree = this.sentenceToTree(this.language.lexer.stringToSentence(texString))
		return tree
	}

}
