
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { CurvedShape } from 'core/vmobjects/CurvedShape'
import { remove } from 'core/functions/arrays'

export class RoundedRectangle extends CurvedShape {

	width: number
	height: number
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	cornerRadius: number

	defaults(): object {
		return Object.assign(super.defaults(), {
			width: 200,
			height: 100,
			cornerRadius: 10,
			p1: Vertex.origin(),
			p2: new Vertex(200, 0),
			p3: new Vertex(200, 100),
			p4: new Vertex(0, 100),
		})
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
			let m12: Vertex = this.p1.add(this.p2).divide(2)
			let p21: Vertex = this.p2.translatedBy(-r, 0)
			let p22: Vertex = this.p2.translatedBy(0, r)
			let m23: Vertex = this.p2.add(this.p3).divide(2)
			let p31: Vertex = this.p3.translatedBy(0, -r)
			let p32: Vertex = this.p3.translatedBy(-r, 0)
			let m34: Vertex = this.p3.add(this.p4).divide(2)
			let p41: Vertex = this.p4.translatedBy(r, 0)
			let p42: Vertex = this.p4.translatedBy(0, -r)
			let m41: Vertex = this.p4.add(this.p1).divide(2)
			this.bezierPoints = new VertexArray([
				p12, p21,
				this.p1, m12, this.p2,
				p12, p21, this.p2,
				this.p2, p22, p31,
				this.p2, m23, this.p3,
				p22, p31, this.p3,
				this.p3, p32, p41,
				this.p3, m34, this.p4,
				p32, p41, this.p4,
				this.p4, p42, p11,
				this.p4, m41, this.p1,
				p42, p11, this.p1,
				this.p1, p12
			])
		} catch { }
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		//// internal dependencies
		this.viewWidth = this.width
		this.viewHeight = this.height

		this.p2.x = this.width
		this.p3.x = this.width
		this.p3.y = this.height
		this.p4.y = this.height

	}

}






















