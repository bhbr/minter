
import { FormalSystem } from './FormalSystem'
import { Rule } from './SentenceTypes'
import { AlgebraLexer } from './AlgebraLexer'
import { AlgebraParser } from './AlgebraParser'

export class Algebra extends FormalSystem {

	declare lexer: AlgebraLexer
	declare parser: AlgebraParser

	isNumber(str: string): boolean {
		return str !== '' && isFinite(Number(str))
	}

	isVariable(str: string): boolean {
		return !this.isNumber(str) && str.length == 1
	}
	
	isTerminalSymbol(str: string): boolean {
		if (super.isTerminalSymbol(str)) { return true }
		return this.isNumber(str) || this.isVariable(str)
	}

	arity(str: string): number {
		if (this.isNumber(str)) { return 0 }
		return super.arity(str)
	}

	defaults(): object {
		return {
			lexer: new AlgebraLexer(),
			parser: new AlgebraParser(),
			arities: { '+': 2, '-': 2, '\\cos': 1, '*': 2, '^': 2, '\\frac': 2, '\\sqrt': 1, '\\pi': 0, '=': 2 },
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

				// a + b = b + a
				'additive_commutativity': [
					['+', [
						'<expression-1>',
						'<expression-2>'
					]],
					['+', [
						'<expression-2>',
						'<expression-1>'
					]]
				] as Rule,

				// (a + b) + c = a + (b + c)
				'additive_associativity_1': [
					['+', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['+', [
						'<expression-1>',
						['+', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// a + (b + c) = (a + b) + c
				'additive_associativity_2': [
					['+', [
						'<expression-1>',
						['+', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['+', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a + (b - c) = (a + b) - c
				'develop_plus_minus_brackets_1': [
					['+', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['-', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a - (b + c) = (a - b) - c
				'develop_plus_minus_brackets_2': [
					['-', [
						'<expression-1>',
						['+', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['-', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a - (b - c) = (a - b) + c
				'develop_plus_minus_brackets_3': [
					['-', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['+', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,


				// a + (b - c) = (a + b) - c
				'form_plus_minus_brackets_1': [
					['-', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['+', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// a - (b + c) = (a - b) - c
				'form_plus_minus_brackets_2': [
					['-', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['-', [
						'<expression-1>',
						['+', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// a - (b - c) = (a - b) + c
				'form_plus_minus_brackets_3': [
					['+', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['-', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// a * b = b * a
				'multiplicative_commutativity': [
					['\\cdot', [
						'<expression-1>',
						'<expression-2>'
					]],
					['\\cdot', [
						'<expression-2>',
						'<expression-1>'
					]],
				] as Rule,

				// (a * b) * c = a * (b * c)
				'multiplicative_associativity_1': [
					['\\cdot', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['\\cdot', [
						'<expression-1>',
						['\\cdot', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// a * (b * c) = (a * b) * c
				'multiplicative_associativity_2': [
					['\\cdot', [
						'<expression-1>',
						['\\cdot', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['\\cdot', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a * (b + c) = a * b + a * c
				'left_develop_addition_bracket': [
					['\\cdot', [
						'<expression-1>', [
							'+', [
								'<expression-2>',
								'<expression-3>'
							]]
						]],
					['+', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot', [
							'<expression-1>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// a * (b - c) = a * b - a * c
				'left_develop_subtraction_bracket': [
					['-', [
						'<expression-1>',
						['+', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['-', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a * b + a * c = a * (b + c)
				'left_factor_addition_bracket': [
					['+', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot', [
							'<expression-1>',
							'<expression-3>'
						]]
					]],
					['*', [
						'<expression-1>',
						['(', [
							['+', [
								'<expression-2>',
								'<expression-3>'
							]]
						]]
					]]
				] as Rule,

				// a * b - a * c = a * (b - c)
				'left_factor_subtraction_bracket': [
					['-', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot', [
							'<expression-1>',
							'<expression-3>'
						]]
					]],
					['\\cdot', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// (a + b) * c = a * c + b * c
				'right_develop_addition_bracket': [
					['\\cdot', [
						['+', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>'
					]],
					['+', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot',
							['<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// (a - b) * c = a * c - b * c
				'right_develop_subtraction_bracket': [
					['\\cdot', [
						['-', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>'
					]],
					['-', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot',
							['<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// a * b + c * b = (a + c) * b
				'right_factor_addition_bracket': [
					['+', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot',
							['<expression-3>',
							'<expression-2>'
						]]
					]],
					['\\cdot', [
						['+', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>'
					]]
				] as Rule,

				// a * b - c * b = (a - c) * b
				'right_factor_subtraction_bracket': [
					['-', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot',
							['<expression-3>',
							'<expression-2>'
						]]
					]],
					['\\cdot', [
						['(', [
							['-', [
								'<expression-1>',
								'<expression-3>'
							]]
						]],
						'<expression-2>'
					]]
				] as Rule,

				// a + b - b = a
				'cancel_plus_and_minus_in_sum': [
					['-', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-2>'
					]],
					'<expression-1>'
				] as Rule,

				// a - b + b = a
				'cancel_minus_and_plus_in_sum': [
					['+', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-2>'
					]],
					'<expression-1>'
				] as Rule,

				// 0 + a = a
				'cancel_left_added_zero': [
					['+', [
						['0', []],
						'<expression-1>'
					]],
					'<expression-1>'
				] as Rule,

				// a + 0 = a
				'cancel_right_added_zero': [
					['+', [
						'<expression-1>',
						['0', []]
					]],
					'<expression-1>'
				] as Rule,

				// a - 0 = a
				'cancel_subtracted_zero': [
					['-', [
						'<expression-1>',
						['0', []]
					]],
					'<expression-1>'
				] as Rule,

				// 1 * a = a
				'cancel_left_multiplied_one': [
					['\\cdot', [
						['1', []],
						'<expression-1>'
					]],
					'<expression-1>'
				] as Rule,

				// a * 1 = a
				'cancel_right_multiplied_one': [
					['\\cdot', [
						'<expression-1>',
						['1', []]
					]],
					'<expression-1>'
				] as Rule,

				// 0 * a = 0
				'cancel_left_multiplied_zero': [
					['\\cdot', [
						['0', []],
						'<expression-1>'
					]],
					['1', []]
				] as Rule,

				// a * 0 = 0
				'cancel_right_multiplied_zero': [
					['\\cdot', [
						'<expression-1>',
						['0', []]
					]],
					['0', []]
				] as Rule,
				
				// a / a = 1
				'cancel_fraction_to_one': [
					['\\frac', [
						'<expression-1>',
						'<expression-1>'
					]],
					['1', []]
				] as Rule,

				// a = b => b = a
				'swap_equation_sides': [
					['=', [
						'<expression-1>',
						'<expression-2>'
					]],
					['=', [
						'<expression-2>',
						'<expression-1>'
					]]
				] as Rule,

				// a + b = c => a = c - b
				'move_addition_to_rhs': [
					['=', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['=', [
						'<expression-1>',
						['-', [
							'<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// a = b + c => a - c = b
				'move_addition_to_lhs': [
					['=', [
						'<expression-1>',
						['+', [
							'<expression-2>',
							'<expression-3>'
						]],
					]],
					['=', [
						['-', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>',
					]]
				] as Rule,

				// a - b = c => a = c + b
				'move_subtraction_to_rhs': [
					['=', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['=', [
						'<expression-1>',
						['+', [
							'<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// a = b - c => a + c = b
				'move_subtraction_to_lhs': [
					['=', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]],
					]],
					['=', [
						['+', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>',
					]]
				] as Rule,
				
			}
		}
	}


}

