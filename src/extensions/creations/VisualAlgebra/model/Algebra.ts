
import { FormalSystem } from './FormalSystem'
import { Rule, SentenceTreeForm, NonterminalSymbol } from './SentenceTypes'
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

	nonterminal(form: SentenceTreeForm): NonterminalSymbol | null {
		if (!isNaN(Number(form[0]))) {
			return '<number>'
		}
		if (form[0].length == 1 && form[1].length == 0) {
			return '<variable>'
		}
		return super.nonterminal(form)
	}

	defaults(): object {
		return {
			lexer: new AlgebraLexer(),
			parser: new AlgebraParser(),
			arities: { '+': 2, '-': 2, '\\cos': 1, '*': 2, '^': 2, '\\frac': 2, 'opp': 1, '\\sqrt': 1, '\\pi': 0, '=': 2 },
			syntaxRules: {
				equation: [
					'<equation>', ['=', ['<expression>', '<expression>']]
				],
				sum: [
					'<expression>', ['+', ['<expression>', '<expression>']]
				],
				difference: [
					'<expression>', ['-', ['<expression>', '<expression>']]
				],
				product: [
					'<expression>', ['\\cdot', ['<expression>', '<expression>']]
				],
				quotient: [
					'<expression>', ['\\frac', ['<expression>', '<expression>']]
				],
				power: [
					'<expression>', ['^', ['<expression>', '<expression>']]
				],
				opposite: [
					'<expression>', ['opp', ['<expression>']]
				],
				variable: [
					'<expression>', '<variable>'
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
					['\\cdot', [
						'<expression-1>',
						['-', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['-', [
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
							['-', [
								'<expression-1>',
								'<expression-3>'
							]],
						'<expression-2>'
					]]
				] as Rule,

				// -(-a) = a
				'cancel_double_opposites': [
					['opp', [
						['opp', [
							'<expression-1>'
						]]
					]],
					'<expression-1>'
				] as Rule,

				// -0 = 0
				'zero_is_its_own_opposite': [
					['opp', [
						['0', []]
					]],
					['0', []]
				] as Rule,

				// -a = b => a = -b
				'swap_sign_in_equation_1': [
					['=',[
						['opp', [
							'<expression-1>'
						]],
						'<expression-2>'
					]],
					['=',[
						'<expression-1>',
						['opp', [
							'<expression-2>'
						]]
					]]
				] as Rule,

				// a = -b => -a = b
				'swap_sign_in_equation_2': [
					['=',[
						'<expression-1>',
						['opp', [
							'<expression-2>'
						]],
					]],
					['=',[
						['opp', [
							'<expression-1>'
						]],
						'<expression-2>',
					]]
				] as Rule,

				// -a = -b => a = b
				'cancel_signs_in_equation': [
					['=', [
						['opp', [
							'<expression-1>'
						]],
						['opp', [
							'<expression-2>'
						]]
					]],
					['=',[
						'<expression-1>',
						'<expression-2>'
					]]
				] as Rule,

				// a = b => -a = -b
				'insert_signs_in_equation': [
					['=',[
						'<expression-1>',
						'<expression-2>'
					]],
					['=', [
						['opp', [
							'<expression-1>'
						]],
						['opp', [
							'<expression-2>'
						]]
					]]
				] as Rule,

				// (-1) * a = -a
				'multiplying_by_minus_one_is_opposite': [
					['\\cdot', [
						['opp', [
							['1', []]
						]],
						'<expression-1>'
					]],
					['opp', [
						'<expression-1>'
					]]
				] as Rule,

				// (-1) * a = -a
				'opposite_is_multiplying_by_minus_one': [
					['opp', [
						'<expression-1>'
					]],
					['\\cdot', [
						['opp', [
							['1', []]
						]],
						'<expression-1>'
					]]
				] as Rule,

				// (-a) * b = -(a * b)
				'sign_product_rule_1': [
					['\\cdot', [
						['opp', [
							'<expression-1>'
						]],
						'<expression-2>'
					]],
					['opp', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// -(a * b) = (-a) * b
				'sign_product_rule_2': [
					['opp', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]]
					]],
					['\\cdot', [
						['opp', [
							'<expression-1>'
						]],
						'<expression-2>'
					]]
				] as Rule,

				// a * (-b) = -(a * b)
				'sign_product_rule_3': [
					['\\cdot', [
						'<expression-1>',
						['opp', [
							'<expression-2>'
						]],
					]],
					['opp', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// -(a * b) = a * (-b)
				'sign_product_rule_4': [
					['opp', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]]
					]],
					['\\cdot', [
						'<expression-1>',
						['opp', [
							'<expression-2>'
						]],
					]]
				] as Rule,

				// (-a) * (-b) = a * b
				'sign_product_rule_5': [
					['\\cdot', [
						['opp', [
							'<expression-1>'
						]],
						['opp', [
							'<expression-2>'
						]]
					]],
					['\\cdot', [
						'<expression-1>',
						'<expression-2>'
					]]
				] as Rule,

				// a * b = (-a) * (-b)
				'sign_product_rule_6': [
					['\\cdot', [
						'<expression-1>',
						'<expression-2>'
					]],
					['\\cdot', [
						['opp', [
							'<expression-1>'
						]],
						['opp', [
							'<expression-2>'
						]]
					]]
				] as Rule,


				// (-a) / b = -(a / b)
				'sign_fraction_rule_1': [
					['\\frac', [
						['opp', [
							'<expression-1>'
						]],
						'<expression-2>'
					]],
					['opp', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// -(a / b) = (-a) / b
				'sign_fraction_rule_2': [
					['opp', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]]
					]],
					['\\frac', [
						['opp', [
							'<expression-1>'
						]],
						'<expression-2>'
					]]
				] as Rule,

				// a / (-b) = -(a / b)
				'sign_fraction_rule_3': [
					['\\frac', [
						'<expression-1>',
						['opp', [
							'<expression-2>'
						]],
					]],
					['opp', [
						['\\sign_fraction_rule_4', [
							'<expression-1>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// -(a / b) = a / (-b)
				'sign_fraction_rule_4': [
					['opp', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]]
					]],
					['\\frac', [
						'<expression-1>',
						['opp', [
							'<expression-2>'
						]],
					]]
				] as Rule,

				// (-a) / (-b) = a / b
				'sign_fraction_rule_5': [
					['\\frac', [
						['opp', [
							'<expression-1>'
						]],
						['opp', [
							'<expression-2>'
						]]
					]],
					['\\frac', [
						'<expression-1>',
						'<expression-2>'
					]]
				] as Rule,

				// a / b = (-a) / (-b)
				'sign_fraction_rule_6': [
					['\\frac', [
						'<expression-1>',
						'<expression-2>'
					]],
					['\\frac', [
						['opp', [
							'<expression-1>'
						]],
						['opp', [
							'<expression-2>'
						]]
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

				// 1 = 1 * a
				'insert_left_multiplied_one': [
					'<expression-1>',
					['\\cdot', [
						['1', []],
						'<expression-1>'
					]]
				] as Rule,

				// a = a * 1
				'insert_right_multiplied_one': [
					'<expression-1>',
					['\\cdot', [
						'<expression-1>',
						['1', []]
					]]
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

				// (a * b) / (a * c) = b / c
				 'left_cancel_fractions': [
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot', [
							'<expression-1>',
							'<expression-3>'
						]],
					]],
					['\\frac', [
						'<expression-2>',
						'<expression-3>'
					]]
				] as Rule,

				// (a * b) / (c * b) = a / c
				'right_cancel_fractions': [
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						['\\cdot', [
							'<expression-3>',
							'<expression-2>'
						]],
					]],
					['\\frac', [
						'<expression-1>',
						'<expression-3>'
					]]
				] as Rule,

				// a / 1 = a
				'cancel_division_by_one': [
					['\\frac', [
						'<expression-1>',
						['1', []]
					]],
					'<expression-1>'
				] as Rule,

				// 0 / a = 0
				'fraction_with_zero_numerator': [
					['\\frac', [
						['0', []],
						'<expression-1>'
					]],
					['0', []],
				] as Rule,

				// (a * b) / b = a
				'cancel_multiplication_with_division_1': [
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-2>'
					]],
					'<expression-1>'
				] as Rule,

				// (a / b) * b = a
				'cancel_multiplication_with_division_2': [
					['\\cdot', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-2>'
					]],
					'<expression-1>'
				] as Rule,

				// a * (b / c) = (a * b) / c
				'bring_left_factor_into_fraction': [
					['\\cdot', [
						'<expression-1>',
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a * (b / c) = (a * b) / c
				'take_left_factor_out_of_fraction': [
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['\\cdot', [
						'<expression-1>',
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]]
					]]
				] as Rule,

				// (a / b) * c = (a * c) / b
				'bring_right_factor_into_fraction': [
					['\\cdot', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>'
					]]
				] as Rule,

				// (a * b) / c = (a / c) * b
				'take_right_factor_out_of_fraction': [
					['\\frac', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['\\cdot', [
						['\\frac', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>'
					]]
				] as Rule,

				// (a + b) / c = a / c + b / c
				'split_sum_fraction': [
					['\\frac', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['+', [
						['\\frac', [
							'<expression-1>',
							'<expression-3>'
						]],
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]],
					]]
				] as Rule,

				// (a - b) / c = a / c - b / c
				'split_subtraction_fraction': [
					['\\frac', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['-', [
						['\\frac', [
							'<expression-1>',
							'<expression-3>'
						]],
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]],
					]]
				] as Rule,

				// a / b + c / b = (a + c) / b
				'join_sum_fraction': [
					['+', [
						['\\frac', [
							'<expression-1>',
							'<expression-3>'
						]],
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]],
					]],
					['\\frac', [
						['+', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
				] as Rule,

				// a / b - c / b = (a - c) / b
				'join_subtraction_fraction': [
					['-', [
						['\\frac', [
							'<expression-1>',
							'<expression-3>'
						]],
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]],
					]],
					['\\frac', [
						['-', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]]
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

				// a * b = c => a = c / b
				'move_right_multiplication_to_rhs': [
					['=', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['=', [
						'<expression-1>',
						['\\frac', [
							'<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// a = b * c => a / c = b
				'move_right_multiplication_to_lhs': [
					['=', [
						'<expression-1>',
						['\\cdot', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['=', [
						['\\frac', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>',
					]]
				] as Rule,

				// a * b = c => b = c / a
				'move_left_multiplication_to_rhs': [
					['=', [
						['\\cdot', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['=', [
						'<expression-2>',
						['\\frac', [
							'<expression-3>',
							'<expression-1>'
						]]
					]]
				] as Rule,

				// a = b * c => a / b = c
				'move_left_multiplication_to_lhs': [
					['=', [
						'<expression-1>',
						['\\cdot', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['=', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>',
					]]
				] as Rule,
				
				// a / b = c => a = c * b
				'move_division_to_rhs': [
					['=', [
						['\\frac', [
							'<expression-1>',
							'<expression-2>'
						]],
						'<expression-3>'
					]],
					['=', [
						'<expression-1>',
						['\\cdot', [
							'<expression-3>',
							'<expression-2>'
						]]
					]]
				] as Rule,

				// a = b / c => a * c = b
				'move_division_to_lhs': [
					['=', [
						'<expression-1>',
						['\\frac', [
							'<expression-2>',
							'<expression-3>'
						]]
					]],
					['=', [
						['\\cdot', [
							'<expression-1>',
							'<expression-3>'
						]],
						'<expression-2>',
					]]
				] as Rule
			}
		}
	}


}

