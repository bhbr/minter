
import { Rectangle } from 'core/shapes/Rectangle'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH } from './constants'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { binomial } from 'core/functions/math'

export class Brick extends Rectangle {
	
	nbFlips: number
	nbTails: number

	defaults(): object {
		return {
			nbFlips: 1,
			nbTails: 0,
			height: BRICK_HEIGHT,
			fillOpacity: 1
		}
	}

	getFillColor(): Color {
		return HEADS_COLOR.interpolate(TAILS_COLOR, 1 - this.nbTails / this.nbFlips)
	}

	combinations(): number {
		return binomial(this.nbFlips, this.nbTails)
	}

	getWidth(): number {
		return this.combinations() / (2 ** this.nbFlips) * ROW_WIDTH
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		super.update({
			fillColor: this.getFillColor(),
			width: this.getWidth()
		})
	}

}