import { addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex } from './helpers'
import { Vertex } from './vertex-transform'
import { Mobject, MGroup, Polygon } from './mobject'
import { Color } from './color'
import { Circle, TwoPointCircle } from './shapes'
import { Arrow, Segment, Ray, Line } from './arrows'
import { LocatedEvent, paperLog } from './helpers'
import { Paper } from '../paper'

export class CreatedMobject extends MGroup {

	startPoint: Vertex = Vertex.origin()
	endPoint: Vertex = Vertex.origin()
	visible: boolean = true

	constructor(argsDict: object = {}) {
		super()
		this.update(argsDict)

	}
	
	dissolveInto(paper: Paper) {
		paper.remove(this)
		if (!this.visible) { return }
		for (let submob of this.children) {
			paper.add(submob)
		}
		paperLog('dissolving CreatedMobject')
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
	}

}

export class Freehand extends CreatedMobject {

	line: Polygon = new Polygon()

	constructor(argsDict: object = {}) {
		super()
		this.add(this.line)
		this.setAttributes({
			strokeColor: Color.white(),
			fillOpacity: 0,
			draggable: false
		})
		this.line.update({
			closed: false,
			strokeColor: this.strokeColor,
			fillOpacity: this.fillOpacity
		})
		this.addDependency('strokeColor', this.line, 'strokeColor')
		this.update(argsDict)
	}
	
	updateWithPoints(q) {
		let nbDrawnPoints: number = this.children.length
		let p = null
		if (nbDrawnPoints > 0) {
			p = (this.children[nbDrawnPoints - 1] as Circle).midPoint
		}
		let pointDistance: number = 10
		let distance: number = ((p.x - q.x)**2 + (p.y - q.y)**2)**0.5
		let unitVector = new Vertex([(q.x - p.x)/distance, (q.y - p.y)/distance])
		for (let step: number = pointDistance; step < distance; step += pointDistance) {
			let x: number = p.x + step * unitVector.x + 0.5 * Math.random()
			let y: number = p.y + step * unitVector.y + 0.5 * Math.random()
			let newPoint: Vertex = new Vertex([x, y])
			let c = new Circle({radius: 2})
			c.fillColor = this.strokeColor
			c.midPoint = new Vertex(newPoint)
			this.add(c)
		}
		let t: number = Math.random()
		let r: number = (1 - t) * 0.5 + t * 0.75
		let c = new Circle({radius: r, midPoint: new Vertex(q)})
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

	radius: number = 5

	constructor(argsDict: object = {}) {
		super()
		this.view.setAttribute('class', this.constructor.name)
		this.setDefaults({
			midPoint: Vertex.origin()
		})
		this.setAttributes({
			fillColor: Color.white(),
			fillOpacity: 1.0
		})
		this.update(argsDict)
	}

}

export class FreePoint extends Point {
	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			draggable: true
		})
		this.update(argsDict)
		this.enableDragging()
	}
}

export class DrawnArrow extends CreatedMobject {

	startFreePoint: FreePoint
	endFreePoint: FreePoint

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.endPoint = this.endPoint || this.startPoint.copy()
		this.passAlongEvents = true
		this.startFreePoint = new FreePoint({
			midPoint: this.startPoint
		})
		this.endFreePoint = new FreePoint({
			midPoint: this.endPoint
		})
		this.addDependency('strokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('fillColor', this.startFreePoint, 'fillColor')
		this.addDependency('strokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('fillColor', this.endFreePoint, 'fillColor')
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.update(argsDict)
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.endFreePoint.midPoint.copyFrom(q)
		this.update()
	}

	dissolveInto(paper: Paper) {
		paper.construction.integrate(this)
	}

}


export class DrawnSegment extends DrawnArrow {

	segment: Segment

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.segment = new Segment({
			startPoint: this.startFreePoint.midPoint,
			endPoint: this.endFreePoint.midPoint
		})
		this.add(this.segment)
		this.startFreePoint.addDependency('midPoint', this.segment, 'startPoint')
		this.endFreePoint.addDependency('midPoint', this.segment, 'endPoint')
		this.addDependency('strokeColor', this.segment, 'strokeColor')
		this.update(argsDict)
	}

}

export class DrawnRay extends DrawnArrow {

	ray: Ray

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.ray = new Ray({
			startPoint: this.startFreePoint.midPoint,
			endPoint: this.endFreePoint.midPoint,
		})
		this.startFreePoint.addDependency('midPoint', this.ray, 'startPoint')
		this.endFreePoint.addDependency('midPoint', this.ray, 'endPoint')
		this.addDependency('strokeColor', this.ray, 'strokeColor')
		this.add(this.ray)
		this.update(argsDict)
	}

}


export class DrawnLine extends DrawnArrow {

	line: Line

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.line = new Line({
			startPoint: this.startFreePoint.midPoint,
			endPoint: this.endFreePoint.midPoint
		})
		this.add(this.line)
		this.startFreePoint.addDependency('midPoint', this.line, 'startPoint')
		this.endFreePoint.addDependency('midPoint', this.line, 'endPoint')
		this.addDependency('strokeColor', this.line, 'strokeColor')
		this.update(argsDict)
	}

}

export class DrawnCircle extends CreatedMobject {

	midPoint: Vertex
	outerPoint: Vertex
	freeMidpoint: FreePoint
	freeOuterPoint: FreePoint
	circle: TwoPointCircle

	constructor(argsDict: object = {}) {
		super(argsDict)
		
		this.setAttributes({
			strokeWidth: 1,
			fillOpacity: 0
		})

		this.midPoint = this.midPoint || this.startPoint.copy()
		this.outerPoint = this.outerPoint || this.startPoint.copy()
		this.passAlongEvents = true
		this.freeMidpoint = new FreePoint({
			midPoint: this.midPoint,
			strokeColor: this.strokeColor,
			fillColor: this.fillColor
		})
		this.freeOuterPoint = new FreePoint({
			midPoint: this.outerPoint,
			strokeColor: this.strokeColor,
			fillColor: this.fillColor
		})
		this.circle = new TwoPointCircle({
			midPoint: this.freeMidpoint.midPoint,
			outerPoint: this.freeOuterPoint.midPoint,
			fillOpacity: 0
		})
		this.add(this.freeMidpoint)
		this.add(this.freeOuterPoint)
		this.add(this.circle)

		this.addDependency('strokeColor', this.freeMidpoint, 'strokeColor')
		this.addDependency('fillColor', this.freeMidpoint, 'fillColor')
		this.addDependency('strokeColor', this.freeOuterPoint, 'strokeColor')
		this.addDependency('fillColor', this.freeOuterPoint, 'fillColor')
		this.addDependency('strokeColor', this.circle, 'strokeColor')
		this.update(argsDict)

	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.outerPoint.copyFrom(q)
		this.freeOuterPoint.midPoint.copyFrom(q)
		this.update()
	}

	dissolveInto(paper: Paper) {
		paper.construction.integrate(this)
	}

	update(argsDict: object = {}, redraw: boolean = true) {
		super.update(argsDict, redraw)
	}


}

















