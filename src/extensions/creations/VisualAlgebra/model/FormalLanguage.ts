
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { NonterminalSymbol, TerminalSymbol, Sentence, SentenceTree, SentenceTreeForm, ComposedSentenceTreeForm, Rule } from './SentenceTypes'
import { equalArrays } from 'core/functions/arrays'
import { log } from 'core/functions/logging'
import { Lexer } from './Lexer'
import { Parser } from './Parser'
import { deepCopy } from 'core/functions/copying'

export class FormalLanguage extends ExtendedObject {

	arities: Record<TerminalSymbol, number>
	syntaxRules: Record<string, [NonterminalSymbol, NonterminalSymbol | SentenceTreeForm]>
	lexer: Lexer
	parser: Parser

	constructor(args: object = {}) {
		super(args)
		this.parser.update({
			language: this
		})
	}

	defaults(): object {
		return {
			arities: { },
			syntaxRules: { },
			lexer: new Lexer(),
			parser: new Parser()
		}
	}

	terminalSymbols(): Array<TerminalSymbol> {
		return Object.keys(this.arities)
	}

	nonterminalSymbols(): Array<NonterminalSymbol> {
		let symbols = Object.values(this.syntaxRules).map((x) => x[0])
		return symbols
	}

	isTerminalSymbol(x: any): boolean {
		let flag = this.terminalSymbols().includes(x)
		return flag
	}

	isNonterminalSymbol(x: any): boolean {
		let flag = this.nonterminalSymbols().includes(x)
		return flag
	}

	isNonterminalVariableSymbol(x: any): boolean {
		if (typeof x !== 'string') { return false }
		let y = x as string
		let leftPart = y.split('-')[0]
		let rightPart = y.split('-')[1]
		let expressionName = leftPart.slice(1)
		let index = rightPart.slice(0, rightPart.length - 1)
		if (`<${expressionName}-${index}>` !== y) {
			return false
		}
		let flag = this.isNonterminalSymbol(`<${expressionName}>`)
		return flag
	}

	arity(str: TerminalSymbol): number {
		return this.arities[str]
	}

	///////////
	// LEXER //
	///////////

	lex(str: string): Sentence {
		return this.lexer.stringToSentence(str)
	}

	////////////
	// PARSER //
	////////////

	parse(sent: Sentence): SentenceTree {
		return this.parser.sentenceToTree(sent)
	}


	// treeToTex(tree: SentenceTree): string {
	// 	let symbol = tree[0]
	// 	let children = tree[1]
	// 	if (children.length == 0) {
	// 		return symbol
	// 	} else if (children.length == 1) {
	// 		if (symbol == '\\sqrt') {
	// 			return `${symbol}{${this.treeToTex(children[0])}}`;
	// 		}
	// 		return `${symbol}(${this.treeToTex(children[0])})`;
	// 	} else if (children.length == 2) {
	// 		if (symbol == '\\frac') {
	// 		return `${symbol}{${this.treeToTex(children[0])}}{${this.treeToTex(children[1])}}`;				
	// 		}
	// 		return `(${this.treeToTex(children[0])} ${symbol} ${this.treeToTex(children[1])})`;
	// 	} else {
	// 		throw 'Unknown number of arguments'
	// 	}
	// }

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
		if (record === null) { return null }
		if (this.isNonterminalVariableSymbol(form)) {
			let existingMatch = record[form as NonterminalSymbol]
			if (existingMatch === undefined) {
				record[form as NonterminalSymbol] = tree
				return record
			} else if (equalArrays(existingMatch, tree)) {
				return record
			} else {
				return null
			}
			
		}
		let formTopSymbol = (form as ComposedSentenceTreeForm)[0]
		let treeTopSymbol = tree[0]
		if (formTopSymbol !== treeTopSymbol) {
			return null
		}
		let formArgs = (form as ComposedSentenceTreeForm)[1]
		let treeArgs = tree[1]
		for (let i = 0; i < tree.length; i++) {
			record = this.matchSentenceTreeForm(formArgs[i], treeArgs[i], record)
		}
		return record
	}

	insert(values: Record<NonterminalSymbol, SentenceTree>, form: SentenceTreeForm): SentenceTreeForm {
		if (this.isNonterminalVariableSymbol(form)) {
			return values[form as NonterminalSymbol]
		}
		let sentenceArgs = (form as ComposedSentenceTreeForm)[1]
		let newArgs: Array<SentenceTreeForm> = []
		for (let i = 0; i < sentenceArgs.length; i++) {
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

	treeContainsSubtree(tree: SentenceTree, subtree: SentenceTree): boolean {
		// array identity is relevant
		if (tree === subtree) {
			return true
		}
		for (let child of tree[1]) {
			if (this.treeContainsSubtree(child, subtree)) {
				return true
			}
		}
		return false
	}

	replaceSubtreeInTree(tree: SentenceTree, subtree: SentenceTree, newSubtree: SentenceTree): SentenceTree {
		if (tree === subtree) {
			return this.clone(newSubtree) as SentenceTree
		}
		for (let i = 0; i < tree[1].length; i++) {
			let child = tree[1][i]
			if (child === subtree) {
				return [tree[0], tree[1].with(i, newSubtree)]
			}
			if (this.treeContainsSubtree(child, subtree)) {
				return [tree[0], tree[1].with(i, this.replaceSubtreeInTree(child, subtree, newSubtree))]
			}
		}
	}

}
