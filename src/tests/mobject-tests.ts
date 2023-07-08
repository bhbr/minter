import { Mobject, TextLabel } from '../modules/mobject'
import { Circle, TwoPointCircle, Rectangle } from '../modules/shapes'
import { Segment } from '../modules/arrows'
import { paper } from '../paper'
import { DEGREES } from '../modules/math'
import { Vertex, Transform } from '../modules/vertex-transform'
import { Color } from '../modules/color'
import { WaveCindyCanvas } from '../modules/cindycanvas'
import { Point, FreePoint } from '../modules/creating'
import { BoxSlider } from '../modules/slider'

export function TransformTest() {
	console.log("creating new circle")
	let c = new Circle({
		midpoint: new Vertex(300, 50)
	})
	paper.add(c)
	c.update({
		midpoint: new Vertex(100, 20)
	})

}

export function MobjectTest() {

	let f = new Mobject({
		viewWidth: 200,
		viewHeight: 200,
		backgroundColor: Color.gray(0.25),
		opacity: 0.5,
		transform: new Transform({angle: 5 * DEGREES}),
		anchor: new Vertex(100, 100),
		drawBorder: true,
		interactive: true,
		draggable: true
	})
	paper.add(f)

	f.update({
		anchor: new Vertex(200, 200)
	})

	f.redraw()

	// let c = new Circle({
	// 	midpoint: new Vertex(50, 150),
	// 	radius: 50,
	// 	fillColor: Color.orange(),
	// 	opacity: 1.0,
	// 	interactive: true
	// })
	// f.add(c)

	let l = new Segment({
		startPoint: new Vertex(100, 0),
		endPoint: new Vertex(150, 50)
	})
	f.add(l)
	l.adjustFrame()

	console.log(f)

	let r = new Rectangle({
		width: 200,
		height: 50,
		anchor: new Vertex(150, 150),
		backgroundColor: Color.blue(),
		fillColor: Color.orange(),
		fillOpacity: 1,
		strokeColor: Color.green()
	})

	paper.add(r)
	console.log(r)
}

export function CircleTest() {
	let p = new Vertex(100, 100)
	let r = 75
	let c = new Circle({
		midpoint: p,
		radius: r,
		drawBorder: true
	})
	paper.add(c)
	c.update({
		radius: 25,
		midpoint: Vertex.origin()
	})
	console.log(c)
}

export function DrawCircleTest() {

	let midpoint = new Vertex(100, 100)
	let outerPoint = new Vertex(200, 200)

	let freeMidpoint = new FreePoint({
		midpoint: midpoint,
	})
	let freeOuterPoint = new FreePoint({
		midpoint: outerPoint,
	})
	let circle = new TwoPointCircle({
		midpoint: freeMidpoint.midpoint,
		outerPoint: freeOuterPoint.midpoint,
		fillOpacity: 0,
		drawBorder: true
	})
	freeMidpoint.addDependency('midpoint', circle, 'midpoint')
	freeOuterPoint.addDependency('midpoint', circle, 'outerPoint')

	paper.add(freeMidpoint)
	paper.add(freeOuterPoint)
	paper.add(circle)
}

export function CindyTest() {

	let cv = new WaveCindyCanvas({
		points: [[0.4, 0.4], [0.3, 0.8]],
		anchor: new Vertex(50, 50),
		id: 'wave'
	})

	paper.add(cv)
	cv.startUp()

	let cv2 = new WaveCindyCanvas({
		points: [[0.1, 0.9], [0.5, 0.4]],
		anchor: new Vertex(200, 50),
		id: 'newwave'
	})

	paper.add(cv2)
	cv2.startUp()
	
}

export function TextTest() {
	let t = new TextLabel({
		text: 'test',
		horizontalAlign: 'center',
		verticalAlign: 'bottom',
		drawBorder: true,
		color: Color.white()
	})
	paper.add(t)
}

export function FreePointTest() {

	let p = new FreePoint()
	console.log('p:', p.anchor)
	paper.add(p)
	p.update({ midpoint: Vertex.origin() })

}

export function SliderTest() {

	let s = new BoxSlider({
		anchor: new Vertex(100, 100),
		height: 150
	})
	paper.add(s)

	//paper.showAllLinks()
}


export function LinkTest() {

	let s = new BoxSlider({
		anchor: new Vertex(100, 100),
		height: 150
	})
	paper.add(s)

	let c = new WaveCindyCanvas({
		anchor: new Vertex(300, 100),
		viewWidth: 100,
		viewHeight: 100,
		points: [[0.4, 0.4], [0.3, 0.8]],
		id: `wavey`
	})
	paper.add(c)
	c.startUp()

	paper.showLinksOfSubmobs()


}








