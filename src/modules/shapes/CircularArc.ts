import { CurvedLine } from './CurvedLine'
import { Vertex } from '../helpers/Vertex'
import { VertexArray } from '../helpers/VertexArray'
import { DEGREES, TAU } from '../helpers/math'

export class CircularArc extends CurvedLine {

	midpoint: Vertex
	radius: number
	angle: number
	nbPoints: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			midpoint: Vertex.origin(),
			radius: 10,
			angle: TAU/4,
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			nbPoints: 32
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
		let d: number = this.radius * 4/3 * Math.tan(this.angle/(4*this.nbPoints))
		for (let i = 0; i <= this.nbPoints; i++) {
			let theta: number = i/this.nbPoints * this.angle
			let radialUnitVector = new Vertex(Math.cos(theta), Math.sin(theta))
			let tangentUnitVector = new Vertex(-Math.sin(theta), Math.cos(theta))
			let anchorPoint: Vertex = radialUnitVector.scaledBy(this.radius)

			let leftControlPoint: Vertex = anchorPoint.translatedBy(tangentUnitVector.scaledBy(-d))
			let rightControlPoint: Vertex = anchorPoint.translatedBy(tangentUnitVector.scaledBy(d))

			if (i != 0) { newBezierPoints.push(leftControlPoint) }
			newBezierPoints.push(anchorPoint)
			if (i != this.nbPoints) { newBezierPoints.push(rightControlPoint) }
		}
		let translatedBezierPoints = new VertexArray()
		for (let i = 0; i < newBezierPoints.length; i++) {
			translatedBezierPoints.push(newBezierPoints[i].translatedBy(this.radius, this.radius))
		}
		this.bezierPoints = translatedBezierPoints

		// do NOT update the view, because redraw calls updateBezierPoints
	}

}