
import { MinterFunctionNode, MinterNumberNode, MinterGroupNode } from 'extensions/creations/MathExpressionField/MinterMathNode'
import { parseTeX, closingParenIndex, leadingTokenGroup, popLeadingTokenGroup, isGroup } from 'extensions/creations/MathExpressionField/MinterParser'
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
	]
})