
import { ValueTest, NumberValueTest, ErrorTest, BundledTest } from '_tests/Tests'
import { Algebra } from 'extensions/creations/VisualAlgebra/model/Algebra'
import { SentenceTree } from 'extensions/creations/VisualAlgebra/model/SentenceTypes'

let algebra = new Algebra()

export const AlgebraParserTest = new BundledTest({
	name: 'Algebra parser test',
	subtests: [
		new ValueTest({
			name: 'Parsing 1.23',
			function: function(): SentenceTree {
				return algebra.parser.parse('1.23')
			},
			value: ['1.23', []]
		}),
		new ValueTest({
			name: 'Parsing 1+2',
			function: function(): SentenceTree {
				return algebra.parser.parse('1+2')
			},
			value: ['+', [['1', []], ['2', []]]]
		}),
		new ValueTest({
			name: 'Parsing 1 + 2',
			function: function(): SentenceTree {
				return algebra.parser.parse('1 + 2')
			},
			value: ['+', [['1', []], ['2', []]]]
		}),
		new ValueTest({
			name: 'Parsing 1 + 2.3',
			function: function(): SentenceTree {
				return algebra.parser.parse('1 + 2.3')
			},
			value: ['+', [['1', []], ['2.3', []]]]
		}),
		new ValueTest({
			name: 'Parsing 1.23 + 4.5',
			function: function(): SentenceTree {
				return algebra.parser.parse('1.23 + 4.5')
			},
			value: ['+', [['1.23', []], ['4.5', []]]]
		}),
		new ValueTest({
			name: 'Parsing a+b',
			function: function(): SentenceTree {
				return algebra.parser.parse('a+b')
			},
			value: ['+', [['a', []], ['b', []]]]
		}),
		new ValueTest({
			name: 'Parsing a * b',
			function: function(): SentenceTree {
				return algebra.parser.parse('a * b')
			},
			value: ['\\cdot', [['a', []], ['b', []]]]
		}),
		new ValueTest({
			name: 'Parsing a \\cdot b',
			function: function(): SentenceTree {
				return algebra.parser.parse('a \\cdot b')
			},
			value: ['\\cdot', [['a', []], ['b', []]]]
		}),
		new ValueTest({
			name: 'Parsing (5)',
			function: function(): SentenceTree {
				return algebra.parser.parse('(5)')
			},
			value: ['5', []]
		}),
		new ValueTest({
			name: 'Parsing (a + b)',
			function: function(): SentenceTree {
				return algebra.parser.parse('(a + b)')
			},
			value: ['+', [['a', []], ['b', []]]]
		}),
		new ValueTest({
			name: 'Parsing 2.3 * (a + b)',
			function: function(): SentenceTree {
				let tree = algebra.parser.parse('2.3 * (a + b)')
				return tree
			},
			value: ['\\cdot', [['2.3', []], ['+', [['a', []], ['b', []]]]]]
		}),
		new ValueTest({
			name: 'Parsing (a + b) * 2.3',
			function: function(): SentenceTree {
				return algebra.parser.parse('(a + b) * 2.3')
			},
			value: ['\\cdot', [['+', [['a', []], ['b', []]]], ['2.3', []]]]
		}),
		new ValueTest({
			name: 'Parsing \\sin(x)',
			function: function(): SentenceTree {
				return algebra.parser.parse('\\sin(x)')
			},
			value: ['\\sin', [['x', []]]]
		}),
		new ValueTest({
			name: 'Parsing \\sin (x)',
			function: function(): SentenceTree {
				return algebra.parser.parse('\\sin (x)')
			},
			value: ['\\sin', [['x', []]]]
		}),
		new ValueTest({
			name: 'Parsing \\sin x',
			function: function(): SentenceTree {
				return algebra.parser.parse('\\sin x')
			},
			value: ['\\sin', [['x', []]]]
		}),
		new ValueTest({
			name: 'Parsing \\sinx (=> null)',
			function: function(): SentenceTree {
				return algebra.parser.parse('\\sinx')
			},
			value: null
		}),
		new ValueTest({
			name: 'Parsing \\sin\\sqrt{1+2}',
			function: function(): SentenceTree {
				return algebra.parser.parse('\\sin\\sqrt{1+2}')
			},
			value: ['\\sin', [['\\sqrt', [['+', [['1', []], ['2', []]]]]]]]
		}),
		new ValueTest({
			name: 'Parsing \\sin \\sqrt{1 + 2}',
			function: function(): SentenceTree {
				return algebra.parser.parse('\\sin \\sqrt{1 + 2}')
			},
			value: ['\\sin', [['\\sqrt', [['+', [['1', []], ['2', []]]]]]]]
		}),
		// new ValueTest({
		// 	name: 'Parsing \\frac {\\sqrt[3] {5}} {\\log_2 ( x + 1 ) }',
		// 	function: function(): SentenceTree {
		// 		return parser.parse('\\frac {\\sqrt[3] {5}} {\\log_2 ( x + 1 ) }')
		// 	},
		// 	value: ['\\frac', '{', '\\sqrt', '[', '3', ']', '{', '5', '}', '}', '{', '\\log', '_', '2', '(', 'x', '+', '1', ')', '}']
		// })

	]
})