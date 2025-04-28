import { equalObjects } from 'core/functions/copying'
import { AssertionTest, BundledTest } from '_tests/Tests'

export const CopyingTest = new BundledTest({
	name: 'Copying test',
	tests: [
		new AssertionTest({
			name: 'Equal objects are equal',
			function: function(): boolean {
				let A = {'a': 1, 'b': 2 }
				let B = {'a': 1, 'b': 2 }
				return equalObjects(A, B)
			}
		})
	]
})
