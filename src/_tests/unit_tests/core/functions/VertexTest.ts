
import { vertexCloseTo, vertexEquals } from 'core/functions/vertex'
import { AssertionTest, BundledTest } from '_tests/Tests'

export const VertexTest = new BundledTest({
	name: 'Vertex test',
	tests: [
		new AssertionTest({
			name: 'A vertex is close to itself',
			function: function(): boolean {
				let v = [1, 2]
				return vertexCloseTo(v, v)
			}
		}),

		new AssertionTest({
			name: 'A vertex equals itself',
			function: function(): boolean {
				let v = [1, 2]
				return vertexEquals(v, v)
			}
		}),
	]
})
