import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Token, TokenType, lexemeToType } from './Token'
import { LexError } from './LexError'

// Port to own TS from tex-math-parser

export class Lexer extends ExtendedObject {
	
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