
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { NonterminalSymbol, TerminalSymbol, Sentence, SentenceTree, SentenceTreeForm, ComposedSentenceTreeForm, Rule } from './SentenceTypes'
import { FormalLanguage } from './FormalLanguage'
import { log } from 'core/functions/logging'


export class FormalSystem extends FormalLanguage {

	inferenceRules: Record<string, Rule>

	defaults(): object {
		return {
			inferenceRules: { }
		}
	}

	applyRuleToTree(ruleName: string, tree: SentenceTree): SentenceTree | null {
		let rule = this.inferenceRules[ruleName]
		if (rule === undefined) {
			throw `Unknown inference rule ${ruleName}`;
		}
		let record = this.matchSentenceTreeForm(rule[0], tree)
		if (record === null) { return null }
		let newTree = this.insert(record, rule[1])
		return newTree as SentenceTree
	}

	applyRuleToSubtreeInTree(ruleName: string, subtree: SentenceTree, tree: SentenceTree): SentenceTree | null {
		if (subtree === tree) {
			return this.applyRuleToTree(ruleName, tree)
		}
	}

	applicableRules(tree: SentenceTree): Record<string, Rule> {
		let result: Record<string, Rule> = {}
		for (let [name, rule] of Object.entries(this.inferenceRules)) {
			let record = this.matchSentenceTreeForm(rule[0], tree)
			if (record !== null) {
				result[name] = rule
			}
		}
		return result
	}
}


