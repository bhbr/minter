
import { Sentence } from './SentenceTypes'
import { log } from 'core/functions/logging'
import { removeAll, replaceAll } from 'core/functions/arrays'
import { Lexer } from './Lexer'

export class AlgebraLexer extends Lexer {

	functionTokens: Array<string>
	tokensToIgnore: Array<string>

	defaults(): object {
		return {
			functionTokens: [
				'\\sqrt',
				'\\log',
				'\\ln',
				'\\exp',
				'\\sin',
				'\\cos',
				'\\tan',
				'\\cot',
				'\\sec',
				'\\csc',
				'\\arcsin',
				'\\arccos',
				'\\arctan',
				'\\arccot',
				'\\arcsec',
				'\\arccsc',
				'\\sinh',
				'\\cosh',
				'\\tanh',
				'\\arcsinh',
				'\\arccosh',
				'\\arctanh'
			],
			tokensToIgnore: [
				'\\left',
				'\\right'
			]
		}
	}

	
	isWhitespace(c: string): boolean {
		return c.trim() === ''
	}

	isLetter(c: string): boolean {
		return /^[A-Za-z]{1,1}$/.test(c)
	}

	isDigit(c: string): boolean {
		return c >= '0' && c <= '9'
	}

	isNumber(c: string): boolean {
		return (!isNaN(Number(c)) && c.length !== 0)
	}

	isFunctionToken(token: string): boolean {
		return this.functionTokens.includes(token)
	}

	isCommand(token: string): boolean {
		return this.functionTokens.includes(token)
			|| this.tokensToIgnore.includes(token)
			|| token == '\\frac'
			|| token == '\\cdot'
	}

	cleanTeXString(texString: string): string {
		// MathQuill does not properly separate digits from preceding commands, e. g. "\\cdot2"
		// This method inserts spaces
		var cleanedString = texString
		cleanedString = cleanedString.replaceAll('\\cdot', '\\cdot ')
		return cleanedString
	}

	stringToSentence(texString: string): Sentence | null {
		let cleanedTeXString = this.cleanTeXString(texString)
		let sentence: Array<string> = []
		var currentToken = ''
		var currentTokenType: string | null = null
		for (let char of cleanedTeXString) {
			if (currentTokenType == null) {
				currentToken = char
				if (this.isDigit(char)) {
					currentTokenType = 'number'
				} else if (this.isWhitespace(char)) {
					continue
				} else if (char == '\\') {
					currentTokenType = 'command'
					continue
				} else {
					currentTokenType = null
					sentence.push(char)
					currentToken = ''
					continue
				}
			} else if (currentTokenType == 'number') {
				if (this.isDigit(char) || char == '.') {
					if (!isNaN(Number(currentToken + char))) {
						currentToken += char
					} else if (char == '.') {
						return null
					} else {
						sentence.push(currentToken)
						currentTokenType = null
						currentToken = ''
						continue
					}
				} else if (this.isWhitespace(char)) {
					currentTokenType = null
					sentence.push(currentToken)
					currentToken = ''
					continue
				} else if (char == '\\') {
					currentTokenType = 'command'
					sentence.push(currentToken)
					currentToken = char
					continue
				} else {
					currentTokenType = null
					sentence.push(currentToken)
					sentence.push(char)
					currentToken = ''
					continue
				}
			} else if (currentTokenType == 'command') {
					if (this.isLetter(char) || this.isDigit(char)) {
						currentToken += char
					} else if (char == '\\') {
						currentTokenType = 'command'
						sentence.push(currentToken)
						currentToken = char
						continue
					} else if (this.isWhitespace(char)) {
						currentTokenType = null
						sentence.push(currentToken)
						currentToken = ''
						continue
					} else {
						currentTokenType = null
						sentence.push(currentToken)
						sentence.push(char)
						currentToken = ''
						continue
					}
				}
		}
		if (currentToken !== '') {
			sentence.push(currentToken)
		}
		for (let token of this.tokensToIgnore) {
			removeAll(sentence, token)
		}
		for (let token of sentence) {
			if (token[0] == '\\') {
				if (!this.isCommand(token)) {
					return null
				}
			}
		}
		replaceAll(sentence, '*', '\\cdot')
		return sentence

	}

	sentenceToString(sent: Sentence): string {
		return '' // TODO: turn back into TeX
	}
	
}