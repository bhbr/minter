
import { TAU } from '../constants.js'
import { vertex } from '@bhbr/affr2'
import { PolygonalLine } from '../vmobjects/PolygonalLine.js'
import { log } from '../functions/logging.js'

export type ArrowTipStyle = 'v' | 'triangle' | 'dart'

export class ArrowTip extends PolygonalLine {
	
	style: ArrowTipStyle
	size: number
	openingAngle: number

	defaults(): object {
		return {
			style: 'v',
			size: 20,
			openingAngle: TAU / 12,
			closed: false
		}
	}

	setup() {
		super.setup()
		this.applyTipStyle()
		this.update({
			strokeWidth: this.strokeWidth,
			strokeColor: this.strokeColor,
			fillColor: this.strokeColor
		})
	}

	applyTipStyle() {
		let rotatedTipAngle1 = this.openingAngle - TAU / 2 - this.openingAngle
		let rotatedTipAngle2 = this.openingAngle - TAU / 2 + this.openingAngle

		switch (this.style) {
		case 'v':
			this.update({
				vertices: [
					[-this.size * Math.sin(rotatedTipAngle1), this.size * Math.cos(rotatedTipAngle1)],
					[0, 0],
					[-this.size * Math.sin(rotatedTipAngle2), this.size * Math.cos(rotatedTipAngle2)]
				],
				closed: false,
				fillOpacity: 0
			})
			break
		case 'triangle':
			this.update({
				vertices: [
					[-this.size * Math.sin(rotatedTipAngle1), this.size * Math.cos(rotatedTipAngle1)],
					[0, 0],
					[-this.size * Math.sin(rotatedTipAngle2), this.size * Math.cos(rotatedTipAngle2)]
				],
				closed: true,
				fillOpacity: 1
			})
			break
		case 'dart':
			this.update({
				vertices: [
					[-this.size * Math.sin(rotatedTipAngle1), this.size * Math.cos(rotatedTipAngle1)],
					[0, 0],
					[-this.size * Math.sin(rotatedTipAngle2), this.size * Math.cos(rotatedTipAngle2)],
					[0.5 * this.size * Math.sin(this.openingAngle), -0.5 * this.size * Math.cos(this.openingAngle)]
				],
				closed: true,
				fillOpacity: 1
			})
			break
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['tipStyle'] !== undefined || args['size'] !== undefined || args['tipAngle'] !== undefined) {
			this.applyTipStyle()
		}
	}


}