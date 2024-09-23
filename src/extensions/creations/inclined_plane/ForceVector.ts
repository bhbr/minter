import { Line } from 'core/shapes/Line'
import { Polygon } from 'core/vmobjects/Polygon'
import { Circle } from 'core/shapes/Circle'
import { DEGREES } from 'core/constants'
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Color } from 'core/classes/Color'

export class ForceVector extends Line {

	foot: Circle
	tip: Polygon
	size: number
	scale: number
	direction: number
	tipOpeningAngle: number
	tipSize: number
	footRadius: number
	color: Color

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			size: 1,
			scale: 100,
			direction: 0,
			color: Color.white()
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			tipOpeningAngle: 60 * DEGREES,
			tipSize: 10,
			footRadius: 4,
			strokeWidth: 3
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.tip = new Polygon({
			fillOpacity: 1,
			strokeWidth: 0
		})
		this.foot = new Circle({
			fillOpacity: 1,
			strokeWidth: 0
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.tip)
		this.add(this.foot)
		this.addDependency('color', this.tip, 'fillColor')
		this.addDependency('color', this.foot, 'fillColor')
		this.addDependency('footRadius', this.foot, 'radius')
		this.addDependency('startPoint', this.foot, 'midpoint')
	}

	updateModel(argsDict: object = {}) {
		let newStartPoint = argsDict['startPoint'] ?? this.startPoint
		let newDirection = argsDict['direction'] ?? this.direction
		let unitVector = new Vertex(Math.cos(newDirection), -Math.sin(newDirection))
		let length = this.size * this.scale - this.tipSize
		argsDict['endPoint'] = newStartPoint.translatedBy(unitVector.scaledBy(length))
		super.updateModel(argsDict)

		if (this.size == 0) {
			this.hide()
		} else {
			this.show()
		}
		this.strokeColor = this.color

		let tipWingSize = this.tipSize / Math.cos(this.tipOpeningAngle / 2)
		let tipVector1 = unitVector.scaledBy(-tipWingSize).rotatedBy(this.tipOpeningAngle / 2)
		let tipVector2 = unitVector.scaledBy(-tipWingSize).rotatedBy(-this.tipOpeningAngle / 2)
		let actualEndPoint = this.endPoint.translatedBy(unitVector.scaledBy(this.tipSize))
		let tipPoint1 = actualEndPoint.translatedBy(tipVector1)
		let tipPoint2 = actualEndPoint.translatedBy(tipVector2)
		this.tip.vertices = new VertexArray([
			actualEndPoint,
			tipPoint1,
			tipPoint2
		])
	}

	mereVector(): Vertex {
		return this.endPoint.subtract(this.startPoint).scaledBy(1 / this.scale)
	}

}