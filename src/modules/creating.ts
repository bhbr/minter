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

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			interactive: true
		})
	}

	dissolveInto(paper: Paper) {
		paper.remove(this)
		console.log('a')
		if (!this.visible) { return }
		console.log('b')
		for (let submob of this.children) {
			console.log(submob)
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

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penFillColor: Color.white(),
			penFillOpacity: 0.0
		})
	}
}

export class Freehand extends DrawnMobject {

	line: Polygon

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			draggable: false
		})
	}
	
	statelessSetup() {
		super.statelessSetup()
		this.line = new Polygon({
			closed: false,
			opacity: 1.0
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
		this.line.update({
			strokeColor: this.penStrokeColor
		})
		this.add(this.line)
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
		this.line.adjustFrame()

		let dr = this.line.anchor
		this.line.update({
			anchor: Vertex.origin()
		})
		this.update({
			anchor: this.anchor.translatedBy(dr),
			viewWidth: this.line.getWidth(),
			viewHeight: this.line.getHeight()
		})

		superMobject.remove(this)
		if (this.visible) {
			superMobject.add(this)
		}
	}

}



export class Point extends Circle {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			radius: 7.0
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			fillColor: Color.white(),
			fillOpacity: 1.0
		})
	}

	statefulSetup() {
		super.statefulSetup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() }, false)
		}

	}

}

export class FreePoint extends Point {

	fixedArgs() {
		return Object.assign(super.fixedArgs(), {
			draggable: true,
			interactive: true
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.enableDragging()
	}
}

export class DrawnArrow extends DrawnMobject {

	startFreePoint: FreePoint
	endFreePoint: FreePoint

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			passAlongEvents: true
		})
	}

	statelessSetup() {
		super.statelessSetup()

		this.startFreePoint = new FreePoint()
		this.endFreePoint = new FreePoint()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.endPoint = this.startPoint.copy()
		this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.startFreePoint, 'fillColor')
		this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.endFreePoint, 'fillColor')
		this.addDependency('startPoint', this.startFreePoint, 'midpoint')
		this.addDependency('endPoint', this.endFreePoint, 'midpoint')
		this.startFreePoint.update({ midpoint: this.startPoint })
		this.endFreePoint.update({ midpoint: this.endPoint })
		

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

	statelessSetup() {
		super.statelessSetup()
		this.segment = new Segment()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.segment)
		this.segment.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		} ,false)
		this.startFreePoint.addDependency('midpoint', this.segment, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.segment, 'endPoint')
		this.addDependency('penStrokeColor', this.segment, 'strokeColor')
	}


}

export class DrawnRay extends DrawnArrow {

	ray: Ray

	statelessSetup() {
		super.statelessSetup()
		this.ray = new Ray()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.ray)
		this.ray.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		} ,false)
		this.startFreePoint.addDependency('midpoint', this.ray, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.ray, 'endPoint')
		this.addDependency('penStrokeColor', this.ray, 'strokeColor')
	}

}


export class DrawnLine extends DrawnArrow {

	line: Line

	statelessSetup() {
		super.statelessSetup()
		this.line = new Line()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.line)
		this.line.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		} ,false)
		this.startFreePoint.addDependency('midpoint', this.line, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.line, 'endPoint')
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
	}


}

export class DrawnCircle extends DrawnMobject {

	midpoint: Vertex
	outerPoint: Vertex
	freeMidpoint: FreePoint
	freeOuterPoint: FreePoint
	circle: TwoPointCircle


	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			strokeWidth: 1,
			fillOpacity: 0,
			passAlongEvents: true
		})
	}


	statelessSetup() {
		super.statelessSetup()
		this.freeMidpoint = new FreePoint()
		this.freeOuterPoint = new FreePoint()
		this.circle = new TwoPointCircle()

	}

	statefulSetup() {
		super.statefulSetup()

		this.midpoint = this.midpoint || this.startPoint.copy()
		this.outerPoint = this.outerPoint || this.startPoint.copy()

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


		this.freeMidpoint.update({
			midpoint: this.midpoint,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		}, false)
		this.freeOuterPoint.update({
			midpoint: this.outerPoint,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		}, false)
		this.circle.update({
			midpoint: this.freeMidpoint.midpoint,
			outerPoint: this.freeOuterPoint.midpoint,
			fillOpacity: 0
		}, false)
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

















