import { Mobject } from '../modules/mobject'
import { Circle } from '../modules/shapes'
import { paper } from '../paper'
import { DEGREES } from '../modules/math'
import { Vertex, Transform } from '../modules/vertex-transform'
import { Color } from '../modules/color'
import { WaveCindyCanvas } from '../modules/cindycanvas'

export function FrameTest() {

	let f = new Mobject({
		_width: 200,
		_height: 200,
		transform: new Transform({angle: 5 * DEGREES}),
		anchor: new Vertex(100, 100),
		drawBorder: true
	})
	paper.add(f)
	f.redraw()

	let c = new Circle({
		midPoint: new Vertex(50, 150),
		radius: 50,
		fillColor: Color.orange(),
		opacity: 0.5
	})
	f.add(c)
	f.enableDragging()

	console.log(f)
}

export function CircleTest() {

	let c = new Circle({
		midPoint: new Vertex(100, 100),
		radius: 50
	})
	paper.add(c)
	c.redraw()
}

export function CindyTest() {

	let cv = new WaveCindyCanvas({
		anchor: new Vertex(50, 50),
		id: 'wave'
	})

	paper.add(cv)
	cv.goLive()

	let cv2 = new WaveCindyCanvas({
		anchor: new Vertex(200, 50),
		id: 'newwave'
	})

	paper.add(cv2)
	cv2.goLive()
}






