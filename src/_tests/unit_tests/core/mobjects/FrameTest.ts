
import { Frame } from 'core/mobjects/Frame'
import { vertex, vertexEquals } from 'core/functions/vertex'
import { DEGREES } from 'core/constants'
import { AssertionTest, ValueTest, BundledTest } from '_tests/Tests'

export const FrameTest = new BundledTest({
	name: 'Frame test',
	subtests: [
		new AssertionTest({
			name: "A frame with no parent has as upper left corner the origin",
			function: function() {
				let f = new Frame({
					anchor: [100, 200],
					width: 300,
					height: 400
				})
				return vertexEquals(f.ulCorner(), [0, 0])
			},
		})
	]
})
