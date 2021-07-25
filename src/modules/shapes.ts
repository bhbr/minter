import { Vertex } from './vertex-transform'
import { Color } from './color'
import { Polygon, CurvedShape, MGroup } from './mobject'
import { Segment } from './arrows'
import { gray, pointerEventVertex } from './helpers'



export class Circle extends CurvedShape {

	midpoint: Vertex
	radius: number

	constructor(argsDict: object = {}) {
		super()
		this.setDefaults({
			midpoint: Vertex.origin(),
			radius: 10
		})
		if (this.constructor.name == 'Circle') {
			this.update(argsDict)
		}
	}

	update(argsDict: object = {}, redraw = true) {

		let r = argsDict['radius'] || this.radius
		let a = argsDict['anchor']
		if (a != undefined) {
			argsDict['midpoint'] = a.translatedBy(r, r)
		} else {
			let m = argsDict['midpoint'] || this.midpoint
			argsDict['anchor'] = m.translatedBy(-r, -r)
		}

		argsDict['viewWidth'] = 2 * r
		argsDict['viewHeight'] = 2 * r

		super.update(argsDict, redraw)
	}

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
		let translatedBezierPoints = []
		for (let i = 0; i < newBezierPoints.length; i++) {
			translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius))
		}
		this.bezierPoints = translatedBezierPoints

		// do NOT update the view, because redraw calls updateBezierPoints
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
		this.setDefaults({
			outerPoint: Vertex.origin()
		})
		this.view.style['pointer-events'] = 'none'

		if (this.constructor.name == 'TwoPointCircle') {
			this.update(argsDict)
		}
	}


	update(argsDict: object = {}, redraw = true) {

		let p = argsDict['midpoint'] || this.midpoint
		let q = argsDict['outerPoint'] || this.outerPoint
		let r = p.subtract(q).norm()
		argsDict['radius'] = r
		super.update(argsDict, redraw)
	}

}

export class Ellipse extends CurvedShape {

	majorAxis: number
	minorAxis: number
	tilt: number
	
	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			midpoint: Vertex.origin(),
			majorAxis: 200,
			minorAxis: 100,
			tilt: 0
		})
		this.update(argsDict)

	}

	get midpoint(): Vertex { return this.anchor }
	set midpoint(newValue: Vertex) { this.anchor = newValue }


}




export class Rectangle extends Polygon {

	width: number
	height: number
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex

	constructor(argsDict: object = {}) {
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
		this.update(argsDict)
	}

	update(argsDict: object = {}, redraw = true) {
		try {
			this.p2.x = argsDict['width'] || this.width
			this.p3.x = argsDict['width'] || this.width
			this.p3.y = argsDict['height'] || this.height
			this.p4.y = argsDict['height'] || this.height
			this.viewWidth = argsDict['width'] || this.width
			this.viewHeight = argsDict['height'] || this.height
			super.update(argsDict, redraw)
		} catch {}
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

	constructor(argsDict: object = {}) {
		super()
		this.setDefaults({
			width: 100,
			height: 100,
			cornerRadius: 10
		})
		this.p1 = Vertex.origin()
		this.p2 = new Vertex([this.width, 0])
		this.p3 = new Vertex([this.width, this.height])
		this.p4 = new Vertex([0, this.height])
		this.update(argsDict)
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











