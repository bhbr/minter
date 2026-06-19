import { log } from 'core/functions/logging'

function isWhitespace(c: string): boolean {
	return c.trim() === ''
}

export function isLetter(c: string): boolean {
	return /^[A-Za-z]{1,1}$/.test(c)
}

function isControl(c: string): boolean {
  return /[^ -~]/.test(c)
}

function isDigit(c: string): boolean {
	return c >= '0' && c <= '9'
}

export function isNumber(c: string): boolean {
	return (!isNaN(Number(c)) && c.length !== 0)
}


export function tokenizeTeXString(texString: string): Array<string> {
	let tokens: Array<string> = []
	var currentToken = ''
	var currentTokenType: string | null = null
	for (let char of texString) {
		if (currentTokenType == null) {
			currentToken = char
			if (isDigit(char)) {
				currentTokenType = 'number'
			} else if (isWhitespace(char)) {
				continue
			} else if (char == '\\') {
				currentTokenType = 'command'
				continue
			} else {
				currentTokenType = null
				tokens.push(char)
				currentToken = ''
				continue
			}
		} else if (currentTokenType == 'number') {
			if (isDigit(char) || char == '.') {
				if (!isNaN(Number(currentToken + char))) {
					currentToken += char
				} else if (char == '.') {
					throw 'lexing error'
				} else {
					tokens.push(currentToken)
					currentTokenType = null
					currentToken = ''
					continue
				}
			} else if (isWhitespace(char)) {
				currentTokenType = null
				tokens.push(currentToken)
				currentToken = ''
				continue
			} else {
				currentTokenType = null
				tokens.push(currentToken)
				tokens.push(char)
				currentToken = ''
				continue
			}
		} else if (currentTokenType == 'command') {
				if (isLetter(char) || isDigit(char)) {
					currentToken += char
				} else if (char == '\\') {
					currentTokenType = 'command'
					tokens.push(currentToken)
					currentToken = char
					continue
				} else if (isWhitespace(char)) {
					currentTokenType = null
					tokens.push(currentToken)
					currentToken = ''
					continue
				} else {
					currentTokenType = null
					tokens.push(currentToken)
					tokens.push(char)
					currentToken = ''
					continue
				}
			}
	}
	if (currentToken !== '') {
		tokens.push(currentToken)
	}
	return tokens

}