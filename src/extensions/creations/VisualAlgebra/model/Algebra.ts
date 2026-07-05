
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
				'additive_commutativity': [
					['+', [
						'<expression-1>',
						'<expression-2>'
					]],
					['+', [
						'<expression-2>',
						'<expression-1>'
					]],
				] as Rule,
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
				] as Rule
			}
		}
	}


}

