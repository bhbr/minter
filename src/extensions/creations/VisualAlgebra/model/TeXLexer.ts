
import { Sentence } from './SentenceTypes'

export class TeXLexer {
	
	static isWhitespace(c: string): boolean {
		return c.trim() === ''
	}

	static isLetter(c: string): boolean {
		return /^[A-Za-z]{1,1}$/.test(c)
	}

	static isDigit(c: string): boolean {
		return c >= '0' && c <= '9'
	}

	static isNumber(c: string): boolean {
		return (!isNaN(Number(c)) && c.length !== 0)
	}

	static functionTokens = [
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
	]

	static isFunctionToken(token: string): boolean {
		return TeXLexer.functionTokens.includes(token)
	}

	static texToSentence(texString: string): Sentence {
		let sentence: Array<string> = []
		var currentToken = ''
		var currentTokenType: string | null = null
		for (let char of texString) {
			if (currentTokenType == null) {
				currentToken = char
				if (TeXLexer.isDigit(char)) {
					currentTokenType = 'number'
				} else if (TeXLexer.isWhitespace(char)) {
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
				if (TeXLexer.isDigit(char) || char == '.') {
					if (!isNaN(Number(currentToken + char))) {
						currentToken += char
					} else if (char == '.') {
						throw 'lexing error'
					} else {
						sentence.push(currentToken)
						currentTokenType = null
						currentToken = ''
						continue
					}
				} else if (TeXLexer.isWhitespace(char)) {
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
			} else if (currentTokenType == 'command') {
					if (TeXLexer.isLetter(char) || TeXLexer.isDigit(char)) {
						currentToken += char
					} else if (char == '\\') {
						currentTokenType = 'command'
						sentence.push(currentToken)
						currentToken = char
						continue
					} else if (TeXLexer.isWhitespace(char)) {
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
		return sentence

	}
	
}