import { rgb, gray, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, isTouchDevice, pointerEventVertex } from './helpers.js'
import { Vertex } from './transform.js'
import { Mobject, MGroup } from './mobject.js'
import { Circle, TwoPointCircle } from './shapes.js'
import { Segment, Ray, Line } from './arrows.js'

const paperView = document.querySelector('#paper')
const paper = paperView.mobject

export class CreatedMobject extends Mobject {
	
	dissolveInto(superMobject) {
		superMobject.remove(this)
		if (!this.visible) { return }
		for (let submob of this.children) {
			superMobject.add(submob)
		}
	}

	updateFromTip(q) { }

}

export class Freehand extends CreatedMobject {
	
	updateWithPoints(q) {
		let nbDrawnPoints = this.submobjects.length
		if (nbDrawnPoints > 0) {
			p = this.children[nbDrawnPoints - 1].midPoint
		}
		let pointDistance = 10
		let distance = ((p.x - q.x)**2 + (p.y - q.y)**2)**0.5
		let unitVector = new Vertex([(q.x - p.x)/distance, (q.y - p.y)/distance])
		for (var step = pointDistance; step < distance; step += pointDistance) {
			let x = p.x + step * unitVector.x + 0.5 * Math.random()
			let y = p.y + step * unitVector.y + 0.5 * Math.random()
			let newPoint = new Vertex([x, y])
			let c = new Circle({radius: 2})
			c.fillColor = this.strokeColor
			c.midPoint = new Vertex(newPoint)
			this.add(c)
		}
		let t = Math.random()
		let r = (1 - t) * 0.5 + t * 0.75
		let c = new Circle({radius: r, midPoint: new Vertex(q)})
		this.add(c)
	}
	
	updateWithLines(q) {

		let nbDrawnPoints = this.children.length
		let p = null
		if (nbDrawnPoints == 0) {
			p = q
		} else {
			p = this.children[nbDrawnPoints - 1].endPoint
		}
		let newLine = new Segment({startPoint: p, endPoint: q})
		newLine.strokeColor = this.strokeColor
		this.add(newLine)

	}
	
	updateFromTip(q) {
		this.updateWithLines(q)
	}

	dissolveInto(superMobject) {
		superMobject.remove(this)
		if (this.visible) {
			superMobject.add(this)
		}
	}
}



export class Point extends Circle {

	constructor(argsDict) {
		super(argsDict)
		this.view.setAttribute('class', this.constructor.name)
		this.setDefaults({
			midPoint: Vertex.origin(),
		})

		this.radius = 5
	}

	update(argsDict) {
		super.update(argsDict)
	}

}

export class FreePoint extends Point {
	constructor(argsDict) {
		super(argsDict)
		this.setAttributes({
			draggable: true
		})
		this.enableDragging()
	}
}

export class DrawnArrow extends CreatedMobject {

	constructor(argsDict) {
		super(argsDict)
		this.endPoint = this.endPoint || this.startPoint.copy()
		this.passAlongEvents = true
		this.startFreePoint = new FreePoint({
			midPoint: this.startPoint
		})
		this.endFreePoint = new FreePoint({
			midPoint: this.endPoint
		})
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		
	}

	updateFromTip(q) {
		this.endPoint.copyFrom(q)
		this.update()
	}

	dissolveInto(superMobject) {
		superMobject.removeFreePoint(this.startFreePoint)
		superMobject.removeFreePoint(this.endFreePoint)

		for (let fq of superMobject.snappablePoints) {
			let q = fq.midPoint
			if (this.startPoint.x == q.x && this.startPoint.y == q.y) {
				this.startPoint = fq.midPoint
				this.startFreePoint = fq
				this.update()
				break
			}
		}
		for (let fq of superMobject.snappablePoints) {
			let q = fq.midPoint
			if (this.endPoint.x == q.x && this.endPoint.y == q.y) {
				this.endPoint = fq.midPoint
				this.endFreePoint = fq
				this.update()
				break
			}
		}

		superMobject.add(this.startFreePoint)
		superMobject.add(this.endFreePoint)
		
	}

}


export class DrawnSegment extends DrawnArrow {

	constructor(argsDict) {

		super(argsDict)
		this.segment = new Segment({
			startPoint: this.startFreePoint.midPoint,
			endPoint: this.endFreePoint.midPoint
		})
		this.add(this.segment)
		this.startFreePoint.addDependent(this.segment)
		this.endFreePoint.addDependent(this.segment)
	}

	dissolveInto(superMobject) {
		super.dissolveInto(superMobject)
		superMobject.remove(this.segment)
		this.segment = new Segment({
			startPoint: this.startPoint,
			endPoint: this.endPoint,
			strokeColor: this.strokeColor,
		})

		this.startFreePoint.addDependent(this.segment)
		this.endFreePoint.addDependent(this.segment)
		superMobject.add(this.segment)

	}
}

export class DrawnRay extends DrawnArrow {

	constructor(argsDict) {
		super(argsDict)
		this.ray = new Ray({
			startPoint: this.startFreePoint.midPoint,
			endPoint: this.endFreePoint.midPoint,
		})
		this.add(this.ray)
		this.startFreePoint.addDependent(this.ray)
		this.endFreePoint.addDependent(this.ray)
	}

	dissolveInto(superMobject) {
		super.dissolveInto(superMobject)
		superMobject.remove(this.ray)
		this.ray = new Ray({
			startPoint: this.startPoint,
			endPoint: this.endPoint,
			strokeColor: this.strokeColor
		})
		this.startFreePoint.addDependent(this.ray)
		this.endFreePoint.addDependent(this.ray)
		superMobject.add(this.ray)

	}
}


export class DrawnLine extends DrawnArrow {

	constructor(argsDict) {
		super(argsDict)
		this.line = new Line({
			startPoint: this.startFreePoint.midPoint,
			endPoint: this.endFreePoint.midPoint
		})
		this.add(this.line)
		this.startFreePoint.addDependent(this.line)
		this.endFreePoint.addDependent(this.line)
	}

	dissolveInto(superMobject) {
		super.dissolveInto(superMobject)
		superMobject.remove(this.line)
		this.line = new Line({
			startPoint: this.startPoint,
			endPoint: this.endPoint,
			strokeColor: this.strokeColor
		})
		this.startFreePoint.addDependent(this.line)
		this.endFreePoint.addDependent(this.line)
		superMobject.add(this.line)

	}


}

export class DrawnCircle extends CreatedMobject {

	constructor(argsDict) {
		super(argsDict)
		
		this.setDefaults({
			strokeColor: rgb(1, 1, 1),
			fillOpacity: 0
		})
		this.setAttributes({
			strokeWidth: 1
		})

		this.midPoint = this.midPoint || this.startPoint.copy()
		this.outerPoint = this.outerPoint || this.startPoint.copy()
		this.passAlongEvents = true
		this.freeMidpoint = new FreePoint({
			midPoint: this.midPoint
		})
		this.freeOuterPoint = new FreePoint({
			midPoint: this.outerPoint
		})
		this.circle = new TwoPointCircle({
			midPoint: this.midPoint,
			outerPoint: this.outerPoint
		})
		this.add(this.freeMidpoint)
		this.add(this.freeOuterPoint)
		this.add(this.circle)

		this.freeMidpoint.addDependent(this.circle)
		this.freeOuterPoint.addDependent(this.circle)

	}

	updateFromTip(q) {
		this.outerPoint.copyFrom(q)
		this.update()
	}

	dissolveInto(superMobject) {
		superMobject.removeFreePoint(this.freeMidpoint)
		superMobject.removeFreePoint(this.freeOuterPoint)

		for (let fq of superMobject.snappablePoints) {
			let q = fq.midPoint
			if (this.midPoint.x == q.x && this.midPoint.y == q.y) {
				this.midPoint = fq.midPoint
				this.freeMidpoint = fq
				this.update()
				break
			}
		}
		for (let fq of superMobject.snappablePoints) {
			let q = fq.midPoint
			if (this.outerPoint.x == q.x && this.outerPoint.y == q.y) {
				this.outerPoint = fq.midPoint
				this.freeOuterPoint = fq
				this.update()
				break
			}
		}

		superMobject.add(this.freeMidpoint)
		superMobject.add(this.freeOuterPoint)
		
		superMobject.remove(this.circle)
		this.circle = new TwoPointCircle({
			midPoint: this.midPoint,
			outerPoint: this.outerPoint
		})
		this.circle.strokeColor = this.strokeColor
		this.freeMidpoint.addDependent(this.circle)
		this.freeOuterPoint.addDependent(this.circle)
		superMobject.add(this.circle)
	}


}






