
import { CircularArc } from '../shapes/CircularArc.js'
import { TAU } from '../constants.js'
import { vertex } from '@bhbr/affr2'
import { PolygonalLine } from '../vmobjects/PolygonalLine.js'
import { log } from '../functions/logging.js'
import { ArrowTip, ArrowTipStyle } from './ArrowTip.js'

export class CurvedArrow extends CircularArc {

	tip: ArrowTip
	
	defaults(): object {
		return {
			tip: new ArrowTip(),
			fillOpacity: 0
		}
	}

	get tipSize(): number { return this.tip.size }
	set tipSize(newValue: number) { this.tip.size = newValue }

	get tipStyle(): ArrowTipStyle { return this.tip.style }
	set tipStyle(newValue: ArrowTipStyle) { this.tip.style = newValue }

	get tipOpeningAngle(): number { return this.tip.openingAngle }
	set tipOpeningAngle(newValue: number) { this.tip.openingAngle = newValue }

	getTangentialUnitVector(): vertex {
		return [-Math.sin(this.angle), Math.cos(this.angle)]
	}

	getRadialUnitVector(): vertex {
		return [Math.cos(this.angle), Math.sin(this.angle)]
	}

	setup() {
		super.setup()
		this.tip.applyTipStyle()
		this.tip.update({
			strokeWidth: this.strokeWidth,
			strokeColor: this.strokeColor,
			fillColor: this.strokeColor
		})
		this.add(this.tip)
	}

	tipPoint(): vertex {
		return [
			this.radius + this.radius * Math.cos(this.angle),
			this.radius + this.radius * Math.sin(this.angle)
		]
	}

	updateBezierPoints() {
		super.updateBezierPoints()
		this.tip.update({
			anchor: this.tipPoint(),
			transformAngle: -this.angle + this.tipOpeningAngle
		})
	}

}