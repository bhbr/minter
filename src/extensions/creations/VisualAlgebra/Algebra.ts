
import { FormalSystem } from './FormalSystem'
import { Rule } from './SentenceTypes'
import { FormulaVisualizer } from './FormulaVisualizer'

export class Algebra extends FormalSystem {

	defaults(): object {
		return {
			arities: { '+': 2, '-': 2, '\\cos': 1, '\\cdot': 2, '^': 2, '\\frac': 2, '\\sqrt': 1, '\\pi': 0 },
			rules: {
				'left_develop_subtraction_bracket': [
					['-', ['<a>', ['+', ['<b>', '<c>']]]],
					['-', [['-', ['<a>', '<b>']], '<c>']]
				] as Rule,
				'left_develop_addition_bracket': [
					['\\cdot', ['<a>', ['+', ['<b>', '<c>']]]],
					['+', [['\\cdot', ['<a>', '<b>']], ['\\cdot', ['<a>', '<c>']]]]
				] as Rule,
				'left_factor_addition_bracket': [
					['+', [['\\cdot', ['<a>', '<b>']], ['\\cdot', ['<a>', '<c>']]]],
					['\\cdot', ['<a>', ['+', ['<b>', '<c>']]]]
				] as Rule,
				'left_factor_subtraction_bracket': [
					['-', [['\\cdot', ['<a>', '<b>']], ['\\cdot', ['<a>', '<c>']]]],
					['\\cdot', ['<a>', ['-', ['<b>', '<c>']]]]
				] as Rule
			}
		}
	}
	
	isTerminalSymbol(str: string): boolean {
		if (super.isTerminalSymbol(str)) { return true }
		return this.isNumber(str) || this.isVariable(str)
	}

	arity(str: string): number {
		if (this.isNumber(str)) { return 0 }
		return super.arity(str)
	}

}


export class AlgebraVisualizer extends FormulaVisualizer {

	declare system: Algebra

	defaults(): object {
		return {
			system: new Algebra()
		}
	}


}