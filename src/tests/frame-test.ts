import { Mobject } from '../modules/mobject'
import { paper } from '../paper'
import { DEGREES } from '../modules/math'
import { Vertex, Transform } from '../modules/vertex-transform'

export function FrameTest() {

	let f = new Mobject({
		_width: 200,
		_height: 200,
		transform: new Transform({angle: - 5 * DEGREES}),
		anchor: new Vertex(100, 100),
		drawBorder: true
	})
	paper.add(f)
	f.redraw()
	console.log(f)
}
