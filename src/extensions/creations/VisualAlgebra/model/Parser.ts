
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { Sentence, SentenceTree } from './SentenceTypes'
import { FormalLanguage } from './FormalLanguage'

export class Parser extends ExtendedObject {

	language: FormalLanguage | null

	defaults(): object {
		return {
			language: null
		}
	}

	parse(sent: Sentence): SentenceTree | null {
		return this.sentenceToTree(sent)
	}

	sentenceToTree(sent: Sentence): SentenceTree {
		// default implementation: Polish notation
		return this.polishToTree(sent)
	}

	treeToSentence(tree: SentenceTree): Sentence {
		// default implementation: Polish notation
		return this.treeToPolish(tree)
	}

	polishToTree(sentence: Sentence): SentenceTree {
		if (sentence.length == 0) {
			throw `Parsing failed because of empty lexed string`;
		}
		let nodeSymbol = sentence[0]
		if (!this.language.isTerminalSymbol(nodeSymbol)) {
			throw `Parsing failed because of unknown symbol`;
		}
		let result: SentenceTree = [nodeSymbol, []]
		let nodeArity = this.language.arity(nodeSymbol)
		if (sentence.length == 1) {
			if (nodeArity == 0) {
				return result
			} else {
				throw `arity > 0 with no more symbols to parse`
			}
		}

		var arityLevel = 1
		var startIndex = 1
		for (var i = startIndex; i < sentence.length; i++) {
			let symbol = sentence[i]
			if (!this.language.isTerminalSymbol(nodeSymbol)) {
				throw `Parsing failed because of unknown symbol`;
			}
			let arity = this.language.arity(symbol)
			arityLevel += arity - 1
			if (arityLevel == 0) {
				let slice = sentence.slice(startIndex, i + 1)
				result[1].push(this.sentenceToTree(slice))
				startIndex = i + 1
				arityLevel += 1
			}
		}
		if (startIndex !== sentence.length) {
			throw `Parsing failed because of mismatched indices`;
		}
		return result
	}

	treeToPolish(tree: SentenceTree): Sentence {
		var arr: Sentence = [tree[0]]
		for (let i = 0; i < tree[1].length; i++) {
			arr = arr.concat(this.treeToSentence(tree[1][i]))
		}
		return arr
	}
}