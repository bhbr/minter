
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Sentence } from './SentenceTypes'

export class Lexer extends ExtendedObject {
	
	lex(str: string): Sentence {
		return this.stringToSentence(str)
	}
	
	stringToSentence(str: string): Sentence {
		// default implementation: Polish notation
		return this.stringToPolish(str)
	}

	sentenceToString(sent: Sentence): string {
		return this.polishToString(sent)
	}

	stringToPolish(str: string): Sentence {
		return str.split(' ')
	}

	polishToString(sent: Sentence): string {
		return sent.join(' ')
	}

}