
import { BetterObject } from '@bhbr/better-things'
import { Sentence } from './SentenceTypes.js'
import { log } from 'functions/logging.js'

export class Lexer extends BetterObject {
	
	lex(str: string): Sentence | null {
		return this.stringToSentence(str)
	}

	stringToSentence(str: string): Sentence | null {
		// default implementation: Polish notation
		return this.stringToPolish(str)
	}

	sentenceToString(sent: Sentence): string {
		return this.polishToString(sent)
	}

	stringToPolish(str: string): Sentence | null {
		return str.split(' ')
	}

	polishToString(sent: Sentence): string {
		return sent.join(' ')
	}

}