
import { vertex, vertexArray, vertexOrigin, vertexTranslatedBy, vertexAdd, vertexDivide, vertexCentrallyScaledBy, vertexArrayImageUnder } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform'
import { CurvedShape } from 'core/vmobjects/CurvedShape'
import { TAU } from 'core/constants'

export class RoundedRectangle extends CurvedShape {

	width: number
	height: number
	cornerRadii: Array<number>
	nbPointsPerCorner: number

	defaults(): object {
		return {
			width: 200,
			height: 100,
			cornerRadii: [10, 10, 10, 10],
			p1: vertexOrigin(),
			p2: [200, 0],
			p3: [200, 100],
			p4: [0, 100],
			nbPointsPerCorner: 8
		}
	}

	setup() {
		super.setup()
		this.view.svg.style.borderRadius = `${Math.min(...this.cornerRadii)}px`
	}

	get cornerRadius(): number {
		if (this.allCornerRadiiEqual()) {
			return this.cornerRadii[0]
		} else {
			throw 'Rounded rectangle has more than one corner radius'
		}
	}
	set cornerRadius(newValue: number) {
		this.cornerRadii = [newValue, newValue, newValue, newValue]
	}

	allCornerRadiiEqual(): boolean {
		return (
			this.cornerRadii.length == 4
			&& this.cornerRadii[0] == this.cornerRadii[1]
			&& this.cornerRadii[1] == this.cornerRadii[2]
			&& this.cornerRadii[2] == this.cornerRadii[3]
		)
	}

	bezierPointsForArcNumber(index: 0 | 1 | 2 | 3): vertexArray {
		let points: vertexArray = []
		let d: number = this.cornerRadii[index] * 4 / 3 * Math.tan(TAU / (16 * this.nbPointsPerCorner))
		for (let i = 0; i <= this.nbPointsPerCorner; i++) {
			let theta: number = (index + i / this.nbPointsPerCorner) * TAU / 4
			let radialUnitVector: vertex = [Math.cos(theta), -Math.sin(theta)]
			let tangentUnitVector: vertex = [-Math.sin(theta), -Math.cos(theta)]
			let anchorPoint: vertex = vertexCentrallyScaledBy(radialUnitVector, this.cornerRadii[index])

			let leftControlPoint: vertex = vertexTranslatedBy(anchorPoint, vertexCentrallyScaledBy(tangentUnitVector, -d))
			let rightControlPoint: vertex = vertexTranslatedBy(anchorPoint, vertexCentrallyScaledBy(tangentUnitVector, d))

			points.push((i != 0) ? leftControlPoint : anchorPoint)
			points.push(anchorPoint)
			points.push((i != this.nbPointsPerCorner) ? rightControlPoint : anchorPoint)
		}
		return points
	}

	updateBezierPoints() {
		let newBezierPoints: vertexArray = []
		let p0 = vertexArrayImageUnder(
			this.bezierPointsForArcNumber(0),
			new Transform({
				shift: [this.width - this.cornerRadii[0], this.cornerRadii[0]]
			})
		)
		newBezierPoints.push(...p0)
		let p1 = vertexArrayImageUnder(
			this.bezierPointsForArcNumber(1),
			new Transform({
				shift: [this.cornerRadii[1], this.cornerRadii[1]]
			})
		)
		newBezierPoints.push(...p1)
		let p2 = vertexArrayImageUnder(
			this.bezierPointsForArcNumber(2),
			new Transform({
				shift: [this.cornerRadii[2], this.height - this.cornerRadii[2]]
			})
		)
		newBezierPoints.push(...p2)
		let p3 = vertexArrayImageUnder(
			this.bezierPointsForArcNumber(3),
			new Transform({
				shift: [this.width - this.cornerRadii[3], this.height - this.cornerRadii[3]]
			})
		)
		newBezierPoints.push(...p3)
		newBezierPoints.push(p0[0])

		this.bezierPoints = newBezierPoints
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)

		//// internal dependencies
		this.view.frame.width = this.width
		this.view.frame.height = this.height

		if (redraw) { this.view.redraw() }
	}

}






















