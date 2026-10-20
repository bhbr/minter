
import { vertex, Transform } from '@bhbr/affr2'
import { Polygon } from 'vmobjects/Polygon.js'
import { log } from 'functions/logging.js'
import { TAU } from 'constants.js'

export class InclinedBox extends Polygon {
	
	width: number
	height: number
	_rotationAngle: number

	defaults(): object {
		return {
			rotationAngle: 0
		}
	}

	get centerOfMass(): vertex {
		return this.view.frame.anchor
	}

	set centerOfMass(newValue: vertex) {
		this.view.frame.update({ anchor: newValue })
	}

	get rotationAngle(): number {
		return this._rotationAngle
	}

	set rotationAngle(newAngle: number) {
		this._rotationAngle = newAngle
		let t = new Transform({
			angle: newAngle
		})
		this.update({
			transform: t
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let w2 = this.width / 2
		let h2 = this.height / 2
		super.update({ vertices: [
			[-w2, -h2], [-w2, h2], [w2, h2], [w2 ,-h2]
		] })
		if (redraw) { this.view.redraw() }
	}

	topDirection(): number {
		return this.rotationAngle + TAU / 4
	}














}