
import { Algebra } from '../model/Algebra'
import { VisualFormula } from './VisualFormula'
import { VisualNumber } from './VisualNumber'
import { VisualVariable } from './VisualVariable'
import { VisualGroup } from './VisualGroup'
import { VisualFunction } from './VisualFunction'
import { VisualOperator } from './VisualOperator'
import { VisualFraction } from './VisualFraction'
import { VisualPower } from './VisualPower'
import { VisualRoot } from './VisualRoot'
import { Sentence, SentenceTree } from '../model/SentenceTypes'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { log } from 'core/functions/logging'

export class VisualFormulaMaker extends ExtendedObject {

	algebra: Algebra

	defaults(): object {
		return {
			algebra: new Algebra()
		}
	}

	treeToVisual(tree: SentenceTree): VisualFormula | null {
		let symbol = tree[0]
		if (this.algebra.lexer.isNumber(symbol)) {
			return new VisualNumber({
				value: Number(symbol),
				formulaTree: tree
			})
		}
		if (this.algebra.lexer.isLetter(symbol)) {
			return new VisualVariable({
				name: symbol,
				formulaTree: tree
			})
		}
		if (this.algebra.lexer.isFunctionToken(symbol)) {
			let child = tree[1][0]
			return new VisualFunction({
				name: symbol,
				child: this.treeToVisual(child),
				formulaTree: tree
			})
		}
		if (symbol == '\\frac') {
			let numerator = tree[1][0]
			let denominator = tree[1][1]
			return new VisualFraction({
				numerator: this.treeToVisual(numerator),
				denominator: this.treeToVisual(denominator),
				formulaTree: tree
			})
		}
		if (this.algebra.parser.isOperator(symbol)) {
			let child1 = tree[1][0]
			let child2 = tree[1][1]
			return new VisualOperator({
				operator: symbol,
				child1: this.treeToVisual(child1),
				child2: this.treeToVisual(child2),
				formulaTree: tree
			})
		}
		if (this.algebra.parser.isOpenParen((symbol))) {
			let child = tree[1][0]
			return new VisualGroup({
				parenType: symbol,
				child: this.treeToVisual(child),
				formulaTree: tree,
				parser: this.algebra.parser
			})
		}
	}

	sentenceToVisual(sentence: Sentence): VisualFormula | null {
		if (sentence.length == 0) { return null }
		return this.treeToVisual(this.algebra.parser.sentenceToTree(sentence))
	}

	texToVisual(tex: string): VisualFormula | null {
		if (tex.trim() == '') { return null }
		return this.treeToVisual(this.algebra.parser.stringToTree(tex))
	}

	texToVisual2(tex: string): VisualFormula | null {
		if (tex.trim() == '') { return null }
		return this.sentenceToVisual(this.algebra.lexer.stringToSentence(tex))
	}

}
