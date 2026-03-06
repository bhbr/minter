
import { CurvedLine } from 'core/vmobjects/CurvedLine'
import { vertex, vertexArray, vertexCentrallyScaledBy, vertexTranslatedBy } from 'core/functions/vertex'

export class Pill extends CurvedLine {
	
	radius: number
	width: number
	nbPointsPerArc: number

	defaults(): object {
		return {
			radius: 50,
			width: 200,
			nbPointsPerArc: 12
		}
	}

	updateBezierPoints() {
		let newBezierPoints: vertexArray = []
		let d: number = this.radius * 4/3 * Math.tan(Math.PI/(4*this.nbPointsPerArc))
		let leftArcCenter: vertex = [this.radius, this.radius]
		for (let i = 0; i <= this.nbPointsPerArc; i++) {
			let theta: number = i/this.nbPointsPerArc * Math.PI + Math.PI/2
			let radialUnitVector: vertex = [Math.cos(theta), Math.sin(theta)]
			let tangentUnitVector: vertex = [-Math.sin(theta), Math.cos(theta)]
			let anchorPoint: vertex = vertexTranslatedBy(leftArcCenter, vertexCentrallyScaledBy(radialUnitVector, this.radius))

			let leftControlPoint: vertex = vertexTranslatedBy(anchorPoint, vertexCentrallyScaledBy(tangentUnitVector, -d))
			let rightControlPoint: vertex = vertexTranslatedBy(anchorPoint, vertexCentrallyScaledBy(tangentUnitVector, d))

			if (i != 0) { newBezierPoints.push(leftControlPoint) }
			newBezierPoints.push(anchorPoint)
			if (i != this.nbPointsPerArc) { newBezierPoints.push(rightControlPoint) }
		}

		newBezierPoints.push([this.width - this.radius, 0])
		newBezierPoints.push([this.radius, 0])

		let rightArcCenter: vertex = [this.width - this.radius, this.radius]
		for (let i = 0; i <= this.nbPointsPerArc; i++) {
			let theta: number = i/this.nbPointsPerArc * Math.PI - Math.PI/2
			let radialUnitVector: vertex = [Math.cos(theta), Math.sin(theta)]
			let tangentUnitVector: vertex = [-Math.sin(theta), Math.cos(theta)]
			let anchorPoint: vertex = vertexTranslatedBy(rightArcCenter, vertexCentrallyScaledBy(radialUnitVector, this.radius))

			let leftControlPoint: vertex = vertexTranslatedBy(anchorPoint, vertexCentrallyScaledBy(tangentUnitVector, -d))
			let rightControlPoint: vertex = vertexTranslatedBy(anchorPoint, vertexCentrallyScaledBy(tangentUnitVector, d))

			if (i != 0) { newBezierPoints.push(leftControlPoint) }
			newBezierPoints.push(anchorPoint)
			if (i != this.nbPointsPerArc) { newBezierPoints.push(rightControlPoint) }
		}		

		this.bezierPoints = newBezierPoints

	}

}