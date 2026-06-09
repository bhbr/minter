
import { tokenizeTeXString } from './MinterLexer'
import { SentenceTree } from 'extensions/creations/VisualAlgebra/SentenceTypes'

export function parseTokens(tokens: Array<string>): SentenceTree {

}

export function parseTeX(texString: string): SentenceTree {
	return parseTokens(tokenizeTeXString(texString))
}