
import { MinterFunctionNode, MinterNumberNode } from 'extensions/creations/MathExpressionField/MinterMathNode'
import { parseTeX } from 'extensions/creations/MathExpressionField/MinterParser'
import { ValueTest, ErrorTest, BundledTest } from '_tests/Tests'
import { log } from 'core/functions/logging'

export const MinterParserTest = new BundledTest({
	name: 'Minter parser test',
	subtests: [
		new ValueTest({
			name: 'MinterFunctionNodes compute their value correctly',
			function: function(): boolean {
				let node = new MinterFunctionNode({
					name: 'sqrt',
					child: new MinterNumberNode({
						value: 9
					})
				})
				return (node.getValue() == 3)
			}
		})
	]
})