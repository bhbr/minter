
import { TeXLexer } from '../model/TeXLexer'
import { TeXParser } from '../model/TeXParser'
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
import { log } from 'core/functions/logging'

export class VisualFormulaMaker {

	static treeToVisual(tree: SentenceTree): VisualFormula | null {
		log('VisualFormula.treeToVisual')
		let symbol = tree[0]
		if (TeXLexer.isNumber(symbol)) {
			return new VisualNumber({
				value: Number(symbol),
				formulaTree: tree
			})
		}
		if (TeXLexer.isLetter(symbol)) {
			return new VisualVariable({
				name: symbol,
				formulaTree: tree
			})
		}
		if (TeXLexer.isFunctionToken(symbol)) {
			let child = tree[1][0]
			return new VisualFunction({
				name: symbol,
				child: VisualFormulaMaker.treeToVisual(child),
				formulaTree: tree
			})
		}
		if (symbol == '\\frac') {
			let numerator = tree[1][0]
			let denominator = tree[1][1]
			return new VisualFraction({
				numerator: VisualFormulaMaker.treeToVisual(numerator),
				denominator: VisualFormulaMaker.treeToVisual(denominator),
				formulaTree: tree
			})
		}
		if (TeXParser.isOperator(symbol)) {
			let child1 = tree[1][0]
			let child2 = tree[1][1]
			return new VisualOperator({
				operator: symbol,
				child1: VisualFormulaMaker.treeToVisual(child1),
				child2: VisualFormulaMaker.treeToVisual(child2),
				formulaTree: tree
			})
		}
		if (TeXParser.isOpenParen((symbol))) {
			let child = tree[1][0]
			return new VisualGroup({
				parenType: symbol,
				child: VisualFormulaMaker.treeToVisual(child),
				formulaTree: tree
			})
		}
	}

	static sentenceToVisual(sentence: Sentence): VisualFormula {
		return VisualFormulaMaker.treeToVisual(TeXParser.sentenceToTree(sentence))
	}

	static texToVisual(tex: string): VisualFormula {
		return VisualFormulaMaker.treeToVisual(TeXParser.texToTree(tex))
	}

	static texToVisual2(tex: string): VisualFormula {
		return VisualFormulaMaker.sentenceToVisual(TeXLexer.texToSentence(tex))
	}

}
