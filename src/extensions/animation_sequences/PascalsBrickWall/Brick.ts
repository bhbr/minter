
import { Rectangle } from 'core/shapes/Rectangle'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH } from './constants'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { binomial } from 'core/functions/math'
import { vertex } from 'core/functions/vertex'

export class Brick extends Rectangle {
	
	nbFlips: number
	nbTails: number
	tailsProbability: number
	headsColor: Color
	tailsColor: Color

	defaults(): object {
		return {
			nbFlips: 1,
			nbTails: 0,
			tailsProbability: 0.5,
			height: BRICK_HEIGHT,
			fillOpacity: 1,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR
		}
	}

	getFillColor(): Color {
		return this.headsColor.interpolate(this.tailsColor, this.nbTails / this.nbFlips)
	}

	combinations(): number {
		return binomial(this.nbFlips, this.nbTails)
	}

	getWidth(): number {
		return this.combinations() * this.tailsProbability ** this.nbTails * (1 - this.tailsProbability) ** (this.nbFlips - this.nbTails) * ROW_WIDTH
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		super.update({
			fillColor: this.getFillColor(),
			width: this.getWidth()
		})
	}







}