
import { equalArrays } from 'core/functions/arrays'
import { AssertionTest, BundledTest } from '_tests/Tests'

export const ArrayTest = new BundledTest({
	name: 'Array test',
	subtests: [
		new AssertionTest({
			name: 'Empty arrays are equal',
			function: function(): boolean {
				return equalArrays([], [])
			}
		}),
		new AssertionTest({
			name: 'Flat number arrays are equal',
			function: function(): boolean {
				return equalArrays([1, 2], [1, 2])
			}
		}),
		new AssertionTest({
			name: 'Flat string arrays are equal',
			function: function(): boolean {
				return equalArrays(['a', 'b'], ['a', 'b'])
			}
		}),
		new AssertionTest({
			name: 'Nested string arrays are equal',
			function: function(): boolean {
				return equalArrays(['a', ['b', []]], ['a', ['b', []]])
			}
		})
	]
})