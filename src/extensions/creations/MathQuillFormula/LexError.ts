
export class LexError extends Error {
	constructor(message: string, pos: number, ...args: any) {
		super(...args)
		this.name = 'LexError'
		this.message = `at ${pos}: ${message}`
	}
}