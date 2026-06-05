import { Line } from 'core/shapes/Line'
import { Polygon } from 'core/vmobjects/Polygon'
import { Circle } from 'core/shapes/Circle'
import { DEGREES } from 'core/constants'
import { vertex, vertexSubtract, vertexTranslatedBy, vertexScaledBy, vertexRotatedBy } from 'core/functions/vertex'
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

	defaults(): object {
		return {
			tip: new Polygon({
				fillOpacity: 1,
				strokeWidth: 0
			}),
			foot: new Circle({
				fillOpacity: 1,
				strokeWidth: 0	
			}),
			scale: 100,
			tipOpeningAngle: 60 * DEGREES,
			tipSize: 10,
			footRadius: 4,

			size: 1,
			direction: 0,
			color: Color.white(),
			strokeWidth: 3
		}
	}

	mutabilities(): object {
		return {
			tip: 'never',
			foot: 'never',
			tipOpeningAngle: 'never',
			tipSize: 'never',
			footRadius: 'never'
		}
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

	update(args: object = {}, redraw: boolean = true) {
		let newStartPoint = args['startPoint'] ?? this.startPoint
		let newDirection = args['direction'] ?? this.direction
		let unitVector: vertex = [Math.cos(newDirection), -Math.sin(newDirection)]
		let length = this.size * this.scale - this.tipSize
		args['endPoint'] = vertexTranslatedBy(newStartPoint, vertexScaledBy(unitVector, length, [0, 0]))
		super.update(args, false)

		this.view.strokeColor = this.color
		if (this.size * this.scale < 5) {
			this.view.hide()
		} else {
			this.view.show()
		}

		let tipWingSize = this.tipSize / Math.cos(this.tipOpeningAngle / 2)
		let tipVector1 = vertexRotatedBy(vertexScaledBy(unitVector, -tipWingSize, [0, 0]), this.tipOpeningAngle / 2, [0, 0])
		let tipVector2 = vertexRotatedBy(vertexScaledBy(unitVector, -tipWingSize, [0, 0]), -this.tipOpeningAngle / 2, [0, 0])
		let tipPoint1 = vertexTranslatedBy(this.endPoint, tipVector1)
		let tipPoint2 = vertexTranslatedBy(this.endPoint, tipVector2)
		this.tip.vertices = [
			this.endPoint,
			tipPoint1,
			tipPoint2
		]

		if (redraw) { this.view.redraw() }
	}

	drawingEndPoint(): vertex {
		let unitVector = [Math.cos(this.direction), -Math.sin(this.direction)]
		return vertexTranslatedBy(this.endPoint, vertexScaledBy(unitVector, -this.tipSize, [0, 0]))
	}

	mereVector(): vertex {
		return vertexScaledBy(this.asVectorOnScreen(), 1 / this.scale, [0, 0])
	}

	asVectorOnScreen(): vertex {
		return vertexSubtract(this.endPoint, this.startPoint)
	}

}