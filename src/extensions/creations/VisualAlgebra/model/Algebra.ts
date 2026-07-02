
import { FormalSystem } from './FormalSystem'
import { Rule } from './SentenceTypes'

export class Algebra extends FormalSystem {

	defaults(): object {
		return {
			arities: { '+': 2, '-': 2, '\\cos': 1, '*': 2, '^': 2, '\\frac': 2, '\\sqrt': 1, '\\pi': 0 },
			syntaxRules: {
				equation: [
					'<equation>', ['=', '<expression>', '<expression>']
				],
				sum: [
					'<expression>', ['+', '<expression>', '<expression>']
				],
				variable: [
					'<expression>', '<variable>',
				],
				number: [
					'<expression>', '<number>'
				]
			},
			inferenceRules: {
				'additive_commutativity': [
					['+', ['<expression-1>', '<expression-2>']],
					['+', ['<expression-2>', '<expression-1>']],
				] as Rule,
				'multiplicative_commutativity': [
					['*', ['<expression-1>', '<expression-2>']],
					['*', ['<expression-2>', '<expression-1>']],
				] as Rule,
				'left_develop_addition_bracket': [
					['*', ['<expression-1>', ['+', ['<expression-2>', '<expression-3>']]]],
					['+', [['*', ['<expression-1>', '<expression-2>']], ['*', ['<expression-1>', '<expression-3>']]]]
				] as Rule,
				'left_develop_subtraction_bracket': [
					['-', ['<expression-1>', ['+', ['<expression-2>', '<expression-3>']]]],
					['-', [['-', ['<expression-1>', '<expression-2>']], '<expression-3>']]
				] as Rule,
				'left_factor_addition_bracket': [
					['+', [['*', ['<expression-1>', '<expression-2>']], ['*', ['<expression-1>', '<expression-3>']]]],
					['*', ['<expression-1>', ['(', [['+', ['<expression-2>', '<expression-3>']]]]]]
				] as Rule,
				'left_factor_subtraction_bracket': [
					['-', [['*', ['<expression-1>', '<expression-2>']], ['*', ['<expression-1>', '<expression-3>']]]],
					['*', ['<expression-1>', ['(', [['-', ['<expression-2>', '<expression-3>']]]]]]
				] as Rule,
				'right_factor_addition_bracket': [
					['+', [
						['*', [
							'<expression-1>',
							'<expression-2>'
						]],
						['*',
							['<expression-3>',
							'<expression-2>'
						]]
					]],
					['*', [
						['(', [
							['+', [
								'<expression-1>',
								'<expression-3>'
							]]
						]],
						'<expression-2>'
					]]
				] as Rule,
				'right_factor_subtraction_bracket': [
					['-', [
						['*', [
							'<expression-1>',
							'<expression-2>'
						]],
						['*',
							['<expression-3>',
							'<expression-2>'
						]]
					]],
					['*', [
						['(', [
							['-', [
								'<expression-1>',
								'<expression-3>'
							]]
						]],
						'<expression-2>'
					]]
				] as Rule,
				'right_develop_addition_bracket': [
					['*', [
						['(', [
							['+', [
								'<expression-1>',
								'<expression-3>'
							]]
						]],
						'<expression-2>'
					]],
					['+', [
						['*', [
							'<expression-1>',
							'<expression-2>'
						]],
						['*',
							['<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,
				'right_develop_subtraction_bracket': [
					['*', [
						['(', [
							['-', [
								'<expression-1>',
								'<expression-3>'
							]]
						]],
						'<expression-2>'
					]],
					['-', [
						['*', [
							'<expression-1>',
							'<expression-2>'
						]],
						['*',
							['<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,
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

