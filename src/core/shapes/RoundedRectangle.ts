
import { vertex, vertexArray, vertexOrigin, vertexTranslatedBy, vertexAdd, vertexDivide } from 'core/functions/vertex'
import { CurvedShape } from 'core/vmobjects/CurvedShape'
import { remove } from 'core/functions/arrays'

export class RoundedRectangle extends CurvedShape {

	width: number
	height: number
	p1: vertex
	p2: vertex
	p3: vertex
	p4: vertex
	cornerRadius: number

	ownDefaults(): object {
		return {
			width: 200,
			height: 100,
			cornerRadius: 10,
			p1: vertexOrigin(),
			p2: [200, 0],
			p3: [200, 100],
			p4: [0, 100]
		}
	}

	updateBezierPoints() {
		try {
			let r = Math.min(this.cornerRadius, Math.min(this.width, this.height)/2)
			this.p2[0] = this.width
			this.p3[0] = this.width
			this.p3[1] = this.height
			this.p4[1] = this.height
			let p11 = vertexTranslatedBy(this.p1, [0, r])
			let p12 = vertexTranslatedBy(this.p1, [r, 0])
			let m12 = vertexDivide(vertexAdd(this.p1, this.p2), 2)
			let p21 = vertexTranslatedBy(this.p2, [-r, 0])
			let p22 = vertexTranslatedBy(this.p2, [0, r])
			let m23 = vertexDivide(vertexAdd(this.p2, this.p3), 2)
			let p31 = vertexTranslatedBy(this.p3, [0, -r])
			let p32 = vertexTranslatedBy(this.p3, [-r, 0])
			let m34 = vertexDivide(vertexAdd(this.p3, this.p4), 2)
			let p41 = vertexTranslatedBy(this.p4, [r, 0])
			let p42 = vertexTranslatedBy(this.p4, [0, -r])
			let m41 = vertexDivide(vertexAdd(this.p4, this.p1), 2)
			this.bezierPoints = [
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
			]
		} catch { }
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)

		//// internal dependencies
		this.viewWidth = this.width
		this.viewHeight = this.height

		this.p2[0] = this.width
		this.p3[0] = this.width
		this.p3[1] = this.height
		this.p4[1] = this.height

		if (redraw) { this.redraw() }
	}

}






















