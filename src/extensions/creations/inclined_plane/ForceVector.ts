import { Line } from 'core/shapes/Line'
import { Polygon } from 'core/vmobjects/Polygon'
import { Circle } from 'core/shapes/Circle'
import { DEGREES } from 'core/constants'
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Color } from 'core/classes/Color'
import { ConStrait } from 'extensions/boards/construction/straits/ConStrait'

export class ForceVector extends ConStrait {

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
			color: Color.white(),
			strokeWidth: 3
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			tipOpeningAngle: 60 * DEGREES,
			tipSize: 10,
			footRadius: 4,
			strokeWidth: 3,
			tip: new Polygon({
				fillOpacity: 1,
				strokeWidth: 0
			}),
			foot: new Circle({
				fillOpacity: 1,
				strokeWidth: 0	
			})
		})
	}

	setup() {
		super.setup()
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

		this.strokeColor = this.color
		if (this.size * this.scale < 5) {
			this.hide()
		} else {
			this.show()
		}

		let tipWingSize = this.tipSize / Math.cos(this.tipOpeningAngle / 2)
		let tipVector1 = unitVector.scaledBy(-tipWingSize).rotatedBy(this.tipOpeningAngle / 2)
		let tipVector2 = unitVector.scaledBy(-tipWingSize).rotatedBy(-this.tipOpeningAngle / 2)
		let tipPoint1 = this.endPoint.translatedBy(tipVector1)
		let tipPoint2 = this.endPoint.translatedBy(tipVector2)
		this.tip.vertices = new VertexArray([
			this.endPoint,
			tipPoint1,
			tipPoint2
		])
	}

	drawingEndPoint(): Vertex {
		let unitVector = new Vertex(Math.cos(this.direction), -Math.sin(this.direction))
		return this.endPoint.translatedBy(unitVector.scaledBy(-this.tipSize))
	}

	mereVector(): Vertex {
		return this.asVectorOnScreen().scaledBy(1 / this.scale)
	}

	asVectorOnScreen(): Vertex {
		return this.endPoint.subtract(this.startPoint)
	}

}