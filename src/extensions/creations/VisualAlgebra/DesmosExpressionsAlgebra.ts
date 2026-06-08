
import { FormalSystem } from './FormalSystem'
import { Rule } from './SentenceTypes'
import { FormulaVisualizer } from './FormulaVisualizer'


export class DesmosExpressionsAlgebra extends FormalSystem {

	defaults(): object {
		return {
			arities: {
				'=': 2,
				'+': 2
			},
			syntaxRules: {
				'<equation>': ['=', '<expression>', '<expression>'],
				'<expression>': ['+', '<expression>', '<expression>'],
				'<expression>': '<variable>',
				'<expression>': '<number>'
			}
		}

}



