import { CurvedShape } from './CurvedShape'
import { Vertex } from '../helpers/Vertex_Transform'
import { VertexArray } from '../helpers/VertexArray'

export class Circle extends CurvedShape {

	midpoint: Vertex
	radius: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			midpoint: Vertex.origin(),
			radius: 10
		})
	}

	updateModel(argsDict: object = {}) {

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

		super.updateModel(argsDict)
	}

	updateBezierPoints() {
		let newBezierPoints = new VertexArray()
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
		let translatedBezierPoints = new VertexArray()
		for (let i = 0; i < newBezierPoints.length; i++) {
			translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius))
		}
		this.bezierPoints = translatedBezierPoints

		// do NOT update the view, because redraw calls updateBezierPoints
	}

}