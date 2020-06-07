import { Vertex } from './transform'
import { Polygon, CurvedShape, Color, MGroup } from './mobject'
import { Segment } from './arrows'
import { gray, pointerEventVertex } from './helpers'



export class Circle extends CurvedShape {

	radius: number
	
	constructor(argsDict: object = {}) {
		super()
		this.setDefaults({
			radius: 10,
			midPoint: Vertex.origin()
		})
		this.setAttributes(argsDict)
	}

	// midPoint is a synonym for anchor
	get midPoint(): Vertex { return this.anchor }
	set midPoint(newValue: Vertex) {
		this.anchor = newValue // updates automatically
	}

	area(): number { return Math.PI * this.radius ** 2 }

	updateBezierPoints() {
		let newBezierPoints: Array<Vertex> = []
		let n: number = 8
		for (let i = 0; i <= n; i++) {
			let theta: number = i/n * 2 * Math.PI
			let d: number = this.radius * 4/3 * Math.tan(Math.PI/(2*n))
			let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta))
			let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta))
			let anchorPoint: Vertex = radialUnitVector.scaledBy(this.radius)

			let leftControlPoint: Vertex = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d))
			let rightControlPoint: Vertex = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d))

			if (i != 0) { newBezierPoints.push(leftControlPoint) }
			newBezierPoints.push(anchorPoint)
			if (i != n) { newBezierPoints.push(rightControlPoint) }
		}
		this.bezierPoints = newBezierPoints

		// do NOT update the view, because redraw calls updateBezierPoints
	}

	rightEdge(): Vertex {
		return new Vertex(this.radius, 0)
	}

}

export class TwoPointCircle extends Circle {

	outerPoint: Vertex

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			strokeColor: Color.white(),
			fillColor: Color.white(),
			fillOpacity: 0
		})
		this.view.style['pointer-events'] = 'none'
		this.update(argsDict)
		this.radius = this.midPoint.subtract(this.outerPoint).norm()
	}

	update(argsDict: object = {}, redraw = true) {
		try { this.radius = this.midPoint.subtract(this.outerPoint).norm() }
		catch { }
		super.update(argsDict, redraw)
	}

}

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number
	tilt: number
	
	constructor(midPoint, majorAxis, minorAxis, tilt) {
		super()
		this.midPoint = midPoint
		this.majorAxis = majorAxis
		this.minorAxis = minorAxis
		this.tilt = tilt

	}

	get midPoint(): Vertex { return this.anchor }
	set midPoint(newValue: Vertex) { this.anchor = newValue }


}




export class Rectangle extends Polygon {

	width: number
	height: number
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex

	constructor(argsDict: object) {
		super()
		this.setDefaults({
			width: 100,
			height: 100
		})
		this.p1 = Vertex.origin()
		this.p2 = new Vertex([this.width, 0])
		this.p3 = new Vertex([this.width, this.height])
		this.p4 = new Vertex([0, this.height])
		this.vertices = [this.p1, this.p2, this.p3, this.p4]
		this.setAttributes(argsDict)
	}

	update(argsDict: object, redraw = true) {
		try {
			this.p2.x = this.width
			this.p3.x = this.width
			this.p3.y = this.height
			this.p4.y = this.height
			super.update(argsDict, redraw)
		} catch { }
	}

	
}




export class RoundedRectangle extends CurvedShape {

	width: number
	height: number
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	cornerRadius: number

	constructor(argsDict: object) {
		super(argsDict)
		this.setDefaults({
			width: 100,
			height: 100,
			cornerRadius: 10
		})
		this.p1 = Vertex.origin()
		this.p2 = new Vertex([this.width, 0])
		this.p3 = new Vertex([this.width, this.height])
		this.p4 = new Vertex([0, this.height])
		this.updateBezierPoints()
	}

	updateBezierPoints() {
		try {
			let r = Math.min(this.cornerRadius, Math.min(this.width, this.height)/2)
			this.p2.x = this.width
			this.p3.x = this.width
			this.p3.y = this.height
			this.p4.y = this.height
			let p11: Vertex = this.p1.translatedBy(0, r)
			let p12: Vertex = this.p1.translatedBy(r, 0)
			let p21: Vertex = this.p2.translatedBy(-r, 0)
			let p22: Vertex = this.p2.translatedBy(0, r)
			let p31: Vertex = this.p3.translatedBy(0, -r)
			let p32: Vertex = this.p3.translatedBy(-r, 0)
			let p41: Vertex = this.p4.translatedBy(r, 0)
			let p42: Vertex = this.p4.translatedBy(0, -r)
			this.bezierPoints = [
				p12, p21,
				p12, p21, this.p2,
				this.p2, p22, p31,
				p22, p31, this.p3,
				this.p3, p32, p41,
				p32, p41, this.p4,
				this.p4, p42, p11,
				p42, p11, this.p1,
				this.p1, p12
			]
		} catch { }
	}

}











