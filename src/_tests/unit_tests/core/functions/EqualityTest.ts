
import { equalArrays } from 'core/functions/arrays'
import { equalObjects } from 'core/functions/copying'
import { AssertionTest, BundledTest } from '_tests/Tests'

export const EqualityTest = new BundledTest({
	name: 'Equality test',
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
		}),
		new AssertionTest({
			name: 'Empty objects are equal',
			function: function(): boolean {
				return equalObjects({}, {})
			}
		}),
		new AssertionTest({
			name: 'Simple objects with same entries and values are equal',
			function: function(): boolean {
				return equalObjects({a: 1, b: 'c'}, {a: 1, b: 'c'})
			}
		}),
		new AssertionTest({
			name: 'Simple objects with same entries but different values are not equal',
			function: function(): boolean {
				return !equalObjects({a: 1, b: 'c'}, {a: 1, b: 'd'})
			}
		}),
		new AssertionTest({
			name: 'Objects with array values are not equal',
			function: function(): boolean {
				return equalObjects({a: [1, 2]}, {a: [1, 2]})
			}
		}),
		new AssertionTest({
			name: 'An object and an extension of it are not equal',
			function: function(): boolean {
				return !equalObjects({a: 1}, {a: 1, b: 'c'})
			}
		}),
		new AssertionTest({
			name: 'Equal objects with empty arrays equal',
			function: function(): boolean {
				return equalObjects({a: []}, {a: []})
			}
		}),
		new AssertionTest({
			name: 'Equal objects with number arrays equal',
			function: function(): boolean {
				return equalObjects({a: [1, 2]}, {a: [1, 2]})
			}
		}),
		new AssertionTest({
			name: 'Equal objects with nested arrays equal',
			function: function(): boolean {
				return equalObjects({a: [1, [2]]}, {a: [1, [2]]})
			}
		}),
		new AssertionTest({
			name: 'Equal objects with arrays containing objects are equal',
			function: function(): boolean {
				return equalObjects({a: [{b: 1}]}, {a: [{b: 1}]})
			}
		}),
		new AssertionTest({
			name: 'Objects from formula matching equal',
			function: function(): boolean {
				return equalObjects(
					{'<expression-1>': ['a', []], '<expression-2>': ['b', []]},
					{'<expression-1>': ['a', []], '<expression-2>': ['b', []]}
				)
			}
		})

























	]
})