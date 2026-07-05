
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Sentence } from './SentenceTypes'
import { log } from 'core/functions/logging'

export class Lexer extends ExtendedObject {
	
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