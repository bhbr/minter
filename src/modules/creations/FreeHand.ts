import { Mobject } from '../mobject/Mobject'
import { DrawnMobject } from './DrawnMobject'
import { Polygon } from '../shapes/Polygon'
import { Circle } from '../shapes/Circle'
import { Vertex } from '../helpers/Vertex_Transform'

export class Freehand extends DrawnMobject {

	line: Polygon

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