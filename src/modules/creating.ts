import { addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex } from './helpers'
import { Vertex } from './vertex-transform'
import { Mobject, MGroup, Polygon } from './mobject'
import { Color } from './color'
import { Circle, TwoPointCircle } from './shapes'
import { Arrow, Segment, Ray, Line } from './arrows'
import { LocatedEvent, paperLog } from './helpers'
import { Paper } from '../paper'

export class CreatedMobject extends MGroup {

	startPoint: Vertex
	endPoint: Vertex
	visible: boolean = true

	constructor(argsDict: object = {}) {
		super()
		this.setDefaults({
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
		this.interactive = true

		if (this.constructor.name == "CreatedMobject") {
			this.update(argsDict)
		}
	}
	
	dissolveInto(paper: Paper) {
		paper.remove(this)
		if (!this.visible) { return }
		for (let submob of this.children) {
			paper.add(submob)
		}
		console.log('dissolving CreatedMobject')
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
	}

}

class DrawnMobject extends CreatedMobject {

	penStrokeColor: Color
	penStrokeWidth: number
	penFillColor: Color
	penFillOpacity: number

	constructor(argsDict: object = {}) {
		super()
		this.setDefaults({
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penFillColor: Color.white(),
			penFillOpacity: 0.0
		})

		if (this.constructor.name == "DrawnMobject") {
			this.update(argsDict)
		}
	}
}

export class Freehand extends DrawnMobject {

	line: Polygon = new Polygon()

	constructor(argsDict: object = {}) {
		super()
		this.add(this.line)
		this.setAttributes({
			draggable: false
		})
		this.line.update({
			closed: false,
			strokeColor: this.penStrokeColor,
			opacity: 1.0
		})
		this.addDependency('penStrokeColor', this.line, 'strokeColor')

		if (this.constructor.name == "Freehand") {
			this.update(argsDict)
		}
	}
	
	updateWithPoints(q) {
		let nbDrawnPoints: number = this.children.length
		let p = null
		if (nbDrawnPoints > 0) {
			p = (this.children[nbDrawnPoints - 1] as Circle).midpoint
		}
		let pointDistance: number = 10
		let distance: number = ((p.x - q.x)**2 + (p.y - q.y)**2)**0.5
		let unitVector = new Vertex([(q.x - p.x)/distance, (q.y - p.y)/distance])
		for (let step: number = pointDistance; step < distance; step += pointDistance) {
			let x: number = p.x + step * unitVector.x + 0.5 * Math.random()
			let y: number = p.y + step * unitVector.y + 0.5 * Math.random()
			let newPoint: Vertex = new Vertex([x, y])
			let c = new Circle({radius: 2})
			c.fillColor = this.penStrokeColor
			c.midpoint = new Vertex(newPoint)
			this.add(c)
		}
		let t: number = Math.random()
		let r: number = (1 - t) * 0.5 + t * 0.75
		let c = new Circle({radius: r, midpoint: new Vertex(q)})
		this.add(c)
	}
	
	updateWithLines(q: Vertex) {
		this.line.vertices.push(q)
	}
	
	updateFromTip(q: Vertex) {
		this.updateWithLines(q)
		this.redraw()
	}

	dissolveInto(superMobject: Mobject) {
		superMobject.remove(this)
		if (this.visible) {
			superMobject.add(this)
		}
	}

}



export class Point extends Circle {

	constructor(argsDict: object = {}) {
		super()
		this.view.setAttribute('class', this.constructor.name)
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() })
		}
		this.setAttributes({
			radius: 7.0,
			fillColor: Color.white(),
			fillOpacity: 1.0
		})

		if (this.constructor.name == "Point") {
			this.update(argsDict)
		}
	}

}

export class FreePoint extends Point {
	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			draggable: true,
			interactive: true
		})

		if (this.constructor.name == "FreePoint") {
			this.update(argsDict)
			this.enableDragging()
		}
	}
}

export class DrawnArrow extends DrawnMobject {

	startFreePoint: FreePoint
	endFreePoint: FreePoint

	constructor(argsDict: object = {}) {
		super()
		this.endPoint = this.startPoint.copy()
		this.passAlongEvents = true
		this.startFreePoint = new FreePoint()
		this.endFreePoint = new FreePoint()
		this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.startFreePoint, 'fillColor')
		this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.endFreePoint, 'fillColor')
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.addDependency('startPoint', this.startFreePoint, 'midpoint')
		this.addDependency('endPoint', this.endFreePoint, 'midpoint')
		this.startFreePoint.update({ midpoint: this.startPoint })
		this.endFreePoint.update({ midpoint: this.endPoint })
		console.log('end point:', this.endPoint)

		if (this.constructor.name == "DrawnArrow") {
			this.update(argsDict)
		}
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.update()
	}

	dissolveInto(paper: Paper) {
		paper.construction.integrate(this)
	}

}


export class DrawnSegment extends DrawnArrow {

	segment: Segment

	constructor(argsDict: object = {}) {
		super()
		this.segment = new Segment({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		})
		this.add(this.segment)
		this.startFreePoint.addDependency('midpoint', this.segment, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.segment, 'endPoint')
		this.addDependency('penStrokeColor', this.segment, 'strokeColor')

		if (this.constructor.name == "DrawnSegment") {
			this.update(argsDict)
		}
	}

}

export class DrawnRay extends DrawnArrow {

	ray: Ray

	constructor(argsDict: object = {}) {
		super()
		this.ray = new Ray({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint,
		})
		this.startFreePoint.addDependency('midpoint', this.ray, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.ray, 'endPoint')
		this.addDependency('penStrokeColor', this.ray, 'strokeColor')
		this.add(this.ray)

		if (this.constructor.name == "DrawnRay") {
			this.update(argsDict)
		}
	}

}


export class DrawnLine extends DrawnArrow {

	line: Line

	constructor(argsDict: object = {}) {
		super()
		this.line = new Line({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		})
		this.add(this.line)
		this.startFreePoint.addDependency('midpoint', this.line, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.line, 'endPoint')
		this.addDependency('penStrokeColor', this.line, 'strokeColor')

		if (this.constructor.name == "DrawnLine") {
			this.update(argsDict)
		}
	}

}

export class DrawnCircle extends DrawnMobject {

	midpoint: Vertex
	outerPoint: Vertex
	freeMidpoint: FreePoint
	freeOuterPoint: FreePoint
	circle: TwoPointCircle

	constructor(argsDict: object = {}) {
		super()
		
		this.setAttributes({
			strokeWidth: 1,
			fillOpacity: 0
		})

		this.midpoint = this.midpoint || this.startPoint.copy()
		this.outerPoint = this.outerPoint || this.startPoint.copy()
		this.passAlongEvents = true
		this.freeMidpoint = new FreePoint({
			midpoint: this.midpoint,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		})
		this.freeOuterPoint = new FreePoint({
			midpoint: this.outerPoint,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		})
		this.circle = new TwoPointCircle({
			midpoint: this.freeMidpoint.midpoint,
			outerPoint: this.freeOuterPoint.midpoint,
			fillOpacity: 0
		})
		this.add(this.freeMidpoint)
		this.add(this.freeOuterPoint)
		this.add(this.circle)

		this.addDependency('penStrokeColor', this.freeMidpoint, 'strokeColor')
		this.addDependency('penFillColor', this.freeMidpoint, 'fillColor')
		this.addDependency('penStrokeColor', this.freeOuterPoint, 'strokeColor')
		this.addDependency('penFillColor', this.freeOuterPoint, 'fillColor')
		this.addDependency('penStrokeColor', this.circle, 'strokeColor')

		this.freeMidpoint.addDependency('midpoint', this.circle, 'midpoint')
		this.freeOuterPoint.addDependency('midpoint', this.circle, 'outerPoint')

		if (this.constructor.name == "DrawnCircle") {
			this.update(argsDict)
		}
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.outerPoint.copyFrom(q)
		this.freeOuterPoint.midpoint.copyFrom(q)
		this.update()
	}

	dissolveInto(paper: Paper) {
		paper.construction.integrate(this)
	}

	update(argsDict: object = {}, redraw: boolean = true) {
		super.update(argsDict, redraw)
	}


}

















