
import { BetterObject } from '@bhbr/better-things'
import { NonterminalSymbol, TerminalSymbol, Sentence, SentenceTree, SentenceTreeForm, ComposedSentenceTreeForm, Rule } from './SentenceTypes.js'
import { FormalLanguage } from './FormalLanguage.js'
import { log } from 'functions/logging.js'


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


