import { Vertex } from '../helpers/Vertex_Transform'
import { CurvedShape } from './CurvedShape'


export class RoundedRectangle extends CurvedShape {

	width: number
	height: number
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	cornerRadius: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			cornerRadius: 10,
			p1: Vertex.origin(),
			p2: Vertex.origin(),
			p3: Vertex.origin(),
			p4: Vertex.origin()
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











