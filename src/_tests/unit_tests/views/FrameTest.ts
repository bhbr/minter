
import { Frame } from '../../../views/Frame.js'
import { vertex, vertexEquals } from '@bhbr/affr2'
import { DEGREES } from '../../../constants.js'
import { AssertionTest, ValueTest, BundledTest } from '@bhbr/tsts'

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
