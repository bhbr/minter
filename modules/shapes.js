import { Vertex } from './transform.js'
import { Polygon, CurvedShape, MGroup } from './mobject.js'
import { Segment } from './arrows.js'
import { rgb, gray, pointerEventVertex } from './helpers.js'



export class Circle extends CurvedShape {
	
	constructor(argsDict) {
		super(argsDict)
		this.setDefaults({
			radius: 10,
			midPoint: Vertex.origin()
		})
	}

	// midPoint is a synonym for anchor
	get midPoint() { return this.anchor }
	set midPoint(newValue) {
		this.anchor = newValue // updates automatically
	}

	getArea() { return Math.PI * this.radius ** 2 }

	updateBezierPoints() {
		let newBezierPoints = []
		let n = 8
		for (let i = 0; i <= n; i++) {
			let theta = i/n * 2 * Math.PI
			let d = this.radius * 4/3 * Math.tan(Math.PI/(2*n))
			let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta))
			let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta))
			let anchorPoint = radialUnitVector.scaledBy(this.radius)

			let leftControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d))
			let rightControlPoint = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d))

			if (i != 0) { newBezierPoints.push(leftControlPoint) }
			newBezierPoints.push(anchorPoint)
			if (i != n) { newBezierPoints.push(rightControlPoint) }
		}
		this.bezierPoints = newBezierPoints

		// do NOT update the view, because updateView calls updateBezierPoints
	}

	rightEdge() {
		return new Vertex(this.radius, 0)
	}

}

export class TwoPointCircle extends Circle {

	constructor(argsDict) {
		super(argsDict)
		this.setAttributes({
			strokeColor: rgb(1, 1, 1),
			fillOpacity: 0
		})
		this.view.style['pointer-events'] = 'none'
		this.radius = this.midPoint.subtract(this.outerPoint).norm()
	}

	update(argsDict) {
		this.radius = this.midPoint.subtract(this.outerPoint).norm()
		super.update(argsDict)
	}

}

export class Ellipse extends CurvedShape {
	
	constructor(midPoint, majorAxis, minorAxis, tilt) {
		super()
		this.majorAxis = majorAxis
		this.minorAxis = minorAxis
		this.tilt = tilt

	}

	get midPoint() { return this.anchor }
	set midPoint(newValue) { this.anchor = newValue }


}




export class Rectangle extends Polygon {
	constructor(argsDict) {
		super(argsDict)
		this.setDefaults({
			width: 100,
			height: 100
		})
		this.p1 = Vertex.origin()
		this.p2 = new Vertex([this.width, 0])
		this.p3 = new Vertex([this.width, this.height])
		this.p4 = new Vertex([0, this.height])
		this.vertices = [this.p1, this.p2, this.p3, this.p4]
	}

	update(argsDict) {
		try {
			this.p2.x = this.width
			this.p3.x = this.width
			this.p3.y = this.height
			this.p4.y = this.height
			super.update(argsDict)
		} catch { }
	}
}




export class RoundedRectangle extends CurvedShape {

	constructor(argsDict) {
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
			let p11 = this.p1.translatedBy(0, r)
			let p12 = this.p1.translatedBy(r, 0)
			let p21 = this.p2.translatedBy(-r, 0)
			let p22 = this.p2.translatedBy(0, r)
			let p31 = this.p3.translatedBy(0, -r)
			let p32 = this.p3.translatedBy(-r, 0)
			let p41 = this.p4.translatedBy(r, 0)
			let p42 = this.p4.translatedBy(0, -r)
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











