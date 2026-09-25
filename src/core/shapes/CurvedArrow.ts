
import { CircularArc } from 'core/shapes/CircularArc'
import { TAU } from 'core/constants'
import { vertex } from 'core/functions/vertex'
import { PolygonalLine } from 'core/vmobjects/PolygonalLine'
import { log } from 'core/functions/logging'

export type ArrowTipStyle = 'v' | 'triangle' | 'dart'

export class CurvedArrow extends CircularArc {

	tip: PolygonalLine
	tipStyle: ArrowTipStyle
	tipSize: number
	tipAngle: number
	
	defaults(): object {
		return {
			tipStyle: 'v',
			tipSize: 20,
			tipAngle: TAU / 12,
			tip: new PolygonalLine({ closed: false }),
			fillOpacity: 0
		}
	}

	getTangentialUnitVector(): vertex {
		return [-Math.sin(this.angle), Math.cos(this.angle)]
	}

	getRadialUnitVector(): vertex {
		return [Math.cos(this.angle), Math.sin(this.angle)]
	}

	setup() {
		super.setup()
		this.applyTipStyle()
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

	applyTipStyle() {
		let rotatedTipAngle1 = this.angle - TAU / 2 - this.tipAngle
		let rotatedTipAngle2 = this.angle - TAU / 2 + this.tipAngle

		switch (this.tipStyle) {
		case 'v':
			this.tip.update({
				vertices: [
					[-this.tipSize * Math.sin(rotatedTipAngle1), this.tipSize * Math.cos(rotatedTipAngle1)],
					[0, 0],
					[-this.tipSize * Math.sin(rotatedTipAngle2), this.tipSize * Math.cos(rotatedTipAngle2)]
				],
				closed: false,
				fillOpacity: 0
			})
			break
		case 'triangle':
			this.tip.update({
				vertices: [
					[-this.tipSize * Math.sin(rotatedTipAngle1), this.tipSize * Math.cos(rotatedTipAngle1)],
					[0, 0],
					[-this.tipSize * Math.sin(rotatedTipAngle2), this.tipSize * Math.cos(rotatedTipAngle2)]
				],
				closed: true,
				fillOpacity: 1
			})
			break
		case 'dart':
			this.tip.update({
				vertices: [
					[-this.tipSize * Math.sin(rotatedTipAngle1), this.tipSize * Math.cos(rotatedTipAngle1)],
					[0, 0],
					[-this.tipSize * Math.sin(rotatedTipAngle2), this.tipSize * Math.cos(rotatedTipAngle2)],
					[0.5 * this.tipSize * Math.sin(this.angle), -0.5 * this.tipSize * Math.cos(this.angle)]
				],
				closed: true,
				fillOpacity: 1
			})
			break
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['tipStyle'] !== undefined || args['tipSize'] !== undefined || args['tipAngle'] !== undefined) {
			this.applyTipStyle()
		}
	}

	updateBezierPoints() {
		super.updateBezierPoints()
		this.tip.update({
			anchor: this.tipPoint()
		})
	}

}