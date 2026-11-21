
import { Line } from '../shapes/Line.js'
import { TAU } from '../constants.js'
import { vertex, vertexSubtract } from '@bhbr/affr2'
import { log } from '../functions/logging.js'
import { ArrowTip, ArrowTipStyle } from './ArrowTip.js'

export class StraightArrow extends Line {

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
		return this.endPoint
	}

	getAngle(): number {
		let dr = vertexSubtract(this.endPoint, this.startPoint)
		return Math.atan2(dr[0], dr[1])
	}

	update(args:object, redraw: boolean = true) {
		super.update(args, redraw)
		this.tip.update({
			anchor: this.tipPoint(),
			transformAngle: this.tipOpeningAngle  + this.getAngle()
		})
	}

}