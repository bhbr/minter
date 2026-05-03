
import { NonterminalSymbol, TerminalSymbol, Sentence, SentenceTree, SentenceTreeForm, ComposedSentenceTreeForm, Rule } from './SentenceTypes'


function equalArrays(arr1: Array<any>, arr2: Array<any>): boolean {
	if (arr1.length !== arr2.length) { return false }
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] === arr2[i]) { continue }
		if (arr1[i].constructor.name == 'Array'
		&& arr2[i].constructor.name == 'Array') {
			if (equalArrays(arr1[i] as Array<any>, arr2[i] as Array<any>)) { continue }
			return false
		}
	}
	return true
}


export class FormalLanguage {

	arities: Record<TerminalSymbol, number>

	terminalSymbols(): Array<TerminalSymbol> {
		return Object.keys(this.arities)
	}

	polishToSentence(str: string): Sentence {
		return str.split(' ')
	}

	isTerminalSymbol(x: any): boolean {
		return this.terminalSymbols().includes(x)
	}

	isNonterminalSymbol(x: any): boolean {
		return typeof x == 'string' && x[0] == '<' && x[x.length - 1] == '>'
	}

	arity(str: TerminalSymbol): number {
		return this.arities[str]
	}

	sentenceToTree(sentence: Sentence):  SentenceTree {
		if (sentence.length == 0) {
			throw `Parsing failed because of empty lexed string`;
		}
		let nodeSymbol = sentence[0]
		if (!this.isTerminalSymbol(nodeSymbol)) {
			throw `Parsing failed because of unknown symbol`;
		}
		let result: SentenceTree = [nodeSymbol, []]
		let nodeArity = this.arity(nodeSymbol)
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
			if (!this.isTerminalSymbol(nodeSymbol)) {
				throw `Parsing failed because of unknown symbol`;
			}
			let arity = this.arity(symbol)
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

	treeToSentence(tree: SentenceTree): Sentence {
		var arr: Sentence = [tree[0]]
		for (let i = 0; i < tree[1].length; i++) {
			arr = arr.concat(this.treeToSentence(tree[1][i]))
		}
		return arr
	}

	sentenceToPolish(sentence: Sentence): string {
		var str = sentence[0]
		for (var i = 1; i < sentence.length; i++) {
			str += ' ' + sentence[i]
		}
		return str
	}

	treeToPolish(tree: SentenceTree): string {
		return this.sentenceToPolish(this.treeToSentence(tree))
	}

	polishToTree(str: string): SentenceTree {
		return this.sentenceToTree(this.polishToSentence(str))
	}

	treeToTex(tree: SentenceTree): string {
		let symbol = tree[0]
		let children = tree[1]
		if (children.length == 0) {
			return symbol
		} else if (children.length == 1) {
			if (symbol == '\\sqrt') {
				return `${symbol}{${this.treeToTex(children[0])}}`;
			}
			return `${symbol}(${this.treeToTex(children[0])})`;
		} else if (children.length == 2) {
			if (symbol == '\\frac') {
			return `${symbol}{${this.treeToTex(children[0])}}{${this.treeToTex(children[1])}}`;				
			}
			return `(${this.treeToTex(children[0])} ${symbol} ${this.treeToTex(children[1])})`;
		} else {
			throw 'Unknown number of arguments'
		}
	}

	matchSentenceTreeForm(
		form: SentenceTreeForm,
		tree: SentenceTree,
		record: Record<NonterminalSymbol, SentenceTree> = {}
	): Record<NonterminalSymbol, SentenceTree> | null {
		// A (term) form is a tree with variables in it
		// (symbols <expr-1>, <expr-2>). This function returns
		// a dictionary of what subtrees have been matched
		// to the variables:
		// { '<a>': subtree1, '<b>': subtree2, ... }
		if (this.isNonterminalSymbol(form)) {
			let existingMatch = record[form as NonterminalSymbol]
			if (existingMatch === undefined) {
				record[form as NonterminalSymbol] = tree
				return record
			} else if (equalArrays(existingMatch, tree)) {
				return record
			} else {
				throw `${tree} does not match ${form}, should equal ${existingMatch}`;
			}
		}
		let formTopSymbol = (form as ComposedSentenceTreeForm)[0]
		let treeTopSymbol = tree[0]
		if (formTopSymbol !== treeTopSymbol) {
			throw `node symbols ${formTopSymbol} and ${treeTopSymbol} do not match`;
		}
		let formArgs = (form as ComposedSentenceTreeForm)[1]
		let treeArgs = tree[1]
		for (var i = 0; i < tree.length; i++) {
			record = this.matchSentenceTreeForm(formArgs[i], treeArgs[i], record)
		}
		return record
	}

	insert(values: Record<NonterminalSymbol, SentenceTree>, form: SentenceTreeForm): SentenceTreeForm {
		if (this.isNonterminalSymbol(form)) {
			return values[form as NonterminalSymbol]
		}
		let sentenceArgs = (form as ComposedSentenceTreeForm)[1]
		let newArgs: Array<SentenceTreeForm> = []
		for (var i = 0; i < sentenceArgs.length; i++) {
			let node = sentenceArgs[i]
			newArgs.push(this.insert(values, node))
		}
		return [form[0], newArgs] as SentenceTreeForm
	}


	clone(form: SentenceTreeForm): SentenceTreeForm {
		if (this.isNonterminalSymbol(form)) {
			return `${form}` as NonterminalSymbol
		}
		let ret: SentenceTreeForm = [(form as ComposedSentenceTreeForm)[0], (form as ComposedSentenceTreeForm)[1]]
		return ret
	}
}




export class FormalSystem extends FormalLanguage {

	rules: Record<string, Rule> = {}

	applyRuleToTree(ruleName: string, tree: SentenceTree): SentenceTree {
		let rule = this.rules[ruleName]
		if (rule === undefined) {
			throw `Unknown inference rule ${ruleName}`;
		}
		let record = this.matchSentenceTreeForm(rule[0], tree)
		let newTree = this.insert(record, rule[1])
		return newTree as SentenceTree
	}

	applyRuleToSentence(ruleName: string, sentence: Sentence): Sentence {
		return this.treeToSentence(
			this.applyRuleToTree(ruleName,
				this.sentenceToTree(sentence)
			)
		)
	}

	applyRuleToPolish(ruleName: string, str: string): string {
		return this.treeToPolish(
			this.applyRuleToTree(ruleName,
				this.polishToTree(str)
			)
		)
	}

	applyRuleToPolish2(ruleName: string, str: string): string {
		return this.sentenceToPolish(
			this.applyRuleToSentence(ruleName,
				this.polishToSentence(str)
			)
		)
	}
}


