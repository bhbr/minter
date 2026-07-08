
import { ValueTest, NumberValueTest, ErrorTest, BundledTest } from '_tests/Tests'
import { Algebra } from 'extensions/creations/VisualAlgebra/model/Algebra'
import { SentenceTree, SentenceTreeForm } from 'extensions/creations/VisualAlgebra/model/SentenceTypes'

let algebra = new Algebra()

export const AlgebraTest = new BundledTest({
	name: 'Algebra matching and transform test',
	subtests: [
		new ValueTest({
			name: 'Matching a * b',
			function: function(): object {
				return algebra.matchSentenceTreeForm(
					['\\cdot', ['<expression-1>', '<expression-2>']] as SentenceTreeForm,
					['\\cdot', [['a', []], ['b', []]]]
				)
			},
			value: {
				'<expression-1>': ['a', []],
				'<expression-2>': ['b', []],
			}
		})
	]
})
