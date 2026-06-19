
import { MinterFunctionNode, MinterNumberNode, MinterGroupNode, MinterFractionNode } from 'extensions/creations/MathExpressionField/MinterMathNode'
import { parseTeX, closingParenIndex, leadingTokenGroup, popLeadingTokenGroup, isGroup, outermostOperatorIndex } from 'extensions/creations/MathExpressionField/MinterParser'
import { ValueTest, NumberValueTest, ErrorTest, BundledTest } from '_tests/Tests'
import { log } from 'core/functions/logging'

export const MinterParserTest = new BundledTest({
	name: 'Minter parser test',
	subtests: [
		new NumberValueTest({
			name: 'MinterFunctionNodes compute their value correctly',
			function: function(): number {
				let node = new MinterFunctionNode({
					name: '\\sqrt',
					child: new MinterNumberNode({
						value: 9
					})
				})
				return node.getValue()
			},
			value: 3
		}),
		new NumberValueTest({
			name: 'Simple MinterFunctionNodes get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\sqrt 5')
				return node.getValue()
			},
			value: Math.sqrt(5)
		}),
		new NumberValueTest({
			name: 'Composed MinterFunctionNodes get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\sqrt \\cos 5')
				return node.getValue()
			},
			value: Math.sqrt(Math.cos(5))
		}),
		new NumberValueTest({
			name: 'Finds position of closing paren correctly',
			function: function(): number {
				let tokens = ['(', '5', ')']
				return closingParenIndex(tokens)
			},
			value: 2
		}),
		new NumberValueTest({
			name: 'MinterGroupNodes get parsed correctly',
			function: function(): number {
				let node = parseTeX('{(5)}')
				return node.getValue()
			},
			value: 5
		}),
		new NumberValueTest({
			name: 'Simple MinterFunctionNodes with parens get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\cos(5)')
				return node.getValue()
			},
			value: Math.cos(5)
		}),
		new NumberValueTest({
			name: 'Composed MinterFunctionNodes with mixed parens get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\sqrt{\\cos(5)}')
				return node.getValue()
			},
			value: Math.sqrt(Math.cos(5))
		}),
		new NumberValueTest({
			name: 'Composed MinterFunctionNodes with same parens get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\sin(\\cos(5))')
				return node.getValue()
			},
			value: Math.sin(Math.cos(5))
		}),
		new NumberValueTest({
			name: 'Simple MinterFractionNodes get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\frac{3}{2}')
				return node.getValue()
			},
			value: 1.5
		}),
		new NumberValueTest({
			name: 'Composed MinterFractionNodes get parsed correctly',
			function: function(): number {
				let node = parseTeX('\\frac{\\sqrt{\\cos(1)}}{\\sqrt{\\sin(2)}}')
				return node.getValue()
			},
			value: Math.sqrt(Math.cos(1)) / Math.sqrt(Math.sin(2))
		}),
		new ValueTest({
			name: 'Outermost operator of simple term gets found correctly',
			function: function(): number {
				let tokens = ['3', '\\cdot', '2', '^', '4', '-', '3']
				let i = outermostOperatorIndex(tokens)
				return i
			},
			value: 5
		}),
		new NumberValueTest({
			name: 'Composed MinterOperatorNodes get parsed correctly',
			function: function(): number {
				let node = parseTeX('3 * 2 ^ 4 - 3')
				return node.getValue()
			},
			value: 45
		}),
		new NumberValueTest({
			name: 'Composed MinterOperatorNodes including functions get parsed correctly',
			function: function(): number {
				let node = parseTeX('3 \\cdot 2^{\\sin(1)} - 3 * \\sqrt{\\frac{4}{5}}')
				return node.getValue()
			},
			value: 3 * 2 ** Math.sin(1) - 3 * Math.sqrt(4 / 5)
		}),
	]
})