
import { Algebra } from '../model/Algebra'
import { VisualFormula } from './VisualFormula'
import { VisualNumber } from './VisualNumber'
import { VisualVariable } from './VisualVariable'
import { VisualGroup } from './VisualGroup'
import { VisualFunction } from './VisualFunction'
import { VisualOperator } from './VisualOperator'
import { VisualEquation } from './VisualEquation'
import { VisualFraction } from './VisualFraction'
import { VisualPower } from './VisualPower'
import { VisualRoot } from './VisualRoot'
import { Sentence, SentenceTree, SubtreeLocation } from '../model/SentenceTypes'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { log } from 'core/functions/logging'
import { deepCopy } from 'core/functions/copying'

export class VisualFormulaMaker extends ExtendedObject {

	algebra: Algebra

	defaults(): object {
		return {
			algebra: new Algebra()
		}
	}

	treeToVisual(tree: SentenceTree, location: SubtreeLocation = []): VisualFormula | null {
		let symbol = tree[0]
		if (this.algebra.lexer.isNumber(symbol)) {
			return new VisualNumber({
				value: Number(symbol),
				formulaTree: tree,
				location: deepCopy(location)
			})
		}
		if (this.algebra.lexer.isLetter(symbol)) {
			return new VisualVariable({
				name: symbol,
				formulaTree: tree,
				location: deepCopy(location)
			})
		}
		if (this.algebra.lexer.isFunctionToken(symbol)) {
			let child = tree[1][0]
			return new VisualFunction({
				name: symbol,
				child: this.treeToVisual(child, location.concat([0])),
				formulaTree: tree,
				location: deepCopy(location)
			})
		}
		if (symbol == '\\frac') {
			let numerator = tree[1][0]
			let denominator = tree[1][1]
			return new VisualFraction({
				numerator: this.treeToVisual(numerator, location.concat([0])),
				denominator: this.treeToVisual(denominator, location.concat([1])),
				formulaTree: tree,
				location: deepCopy(location)
			})
		}
		if (this.algebra.parser.isOperator(symbol)) {
			let child1 = tree[1][0]
			let child2 = tree[1][1]
			if (symbol == '=') {
				return new VisualEquation({
					child1: this.treeToVisual(child1, location.concat([0])),
					child2: this.treeToVisual(child2, location.concat([1])),
					formulaTree: tree,
					location: deepCopy(location)
				})
			} else {
				return new VisualOperator({
					operator: symbol,
					child1: this.treeToVisual(child1, location.concat([0])),
					child2: this.treeToVisual(child2, location.concat([1])),
					formulaTree: tree,
					location: deepCopy(location)
				})
			}
		}
		if (this.algebra.parser.isOpenParen((symbol))) {
			let child = tree[1][0]
			return new VisualGroup({
				parenType: symbol,
				child: this.treeToVisual(child, location.concat([0])),
				formulaTree: tree,
				location: deepCopy(location),
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
