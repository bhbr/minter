import { Token } from './Token'

export class ParseError extends Error {
	constructor(message: string, token: Token, ...args: Array<any>) {
		super(...args)
		this.name = 'ParseError'
		this.message = `${token.lexeme} at ${token.pos}: ${message}`
	}
}
