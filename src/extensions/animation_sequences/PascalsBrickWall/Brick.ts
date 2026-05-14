
import { Rectangle } from 'core/shapes/Rectangle'
import { HEADS_COLOR, TAILS_COLOR, BRICK_WIDTH, ROW_LENGTH, BRICK_STROKE_WIDTH, BRICK_FILL_OPACITY } from './constants'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { binomial } from 'core/functions/math'
import { vertex, vertexAdd } from 'core/functions/vertex'
import { Line } from 'core/shapes/Line'
import { Circle } from 'core/shapes/Circle'

export class Brick extends Rectangle {
	
	nbFlips: number
	nbTails: number
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	widthScale: number
	anchorMarker: Circle

	defaults(): object {
		return {
			nbFlips: 1,
			nbTails: 0,
			tailsProbability: 0.5,
			height: BRICK_WIDTH,
			widthScale: ROW_LENGTH,
			fillOpacity: BRICK_FILL_OPACITY,
			strokeWidth: BRICK_STROKE_WIDTH,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			anchorMarker: new Circle({
				fillColor: Color.green(),
				fillOpacity: 1,
				radius: 5
			})
		}
	}

	setup() {
		super.setup()
		this.anchorMarker.update({
			midpoint: this.anchor
		})
		this.add(this.anchorMarker)
	}

	headsProbability(): number {
		return 1 - this.tailsProbability
	}

	leftPartColor(): Color {
		return this.headsColor.interpolate(this.tailsColor, this.nbTails / (this.nbFlips + 1))
	}

	rightPartAnchor(): vertex {
		return [this.leftPartWidth(), 0]
	}

	leftPartWidth(): number {
		return this.headsProbability() * this.getWidth()
	}

	rightPartWidth(): number {
		return this.tailsProbability * this.getWidth()
	}

	rightPartColor(): Color {
		return this.headsColor.interpolate(this.tailsColor, (this.nbTails + 1) / (this.nbFlips + 1))
	}

	makeLeftPart(): Rectangle {
		return new Rectangle({
			transform: this.transform.copy(),
			height: this.height,
			width: this.leftPartWidth(),
			fillColor: this.getFillColor(),
			fillOpacity: BRICK_FILL_OPACITY,
			strokeWidth: BRICK_STROKE_WIDTH
		})
	}

	makeRightPart(): Rectangle {
		let b =  new Rectangle({
			transform: this.transform.copy(),
			height: this.height,
			width: this.rightPartWidth(),
			fillColor: this.getFillColor().brighten(0.8),
			fillOpacity: BRICK_FILL_OPACITY,
			strokeWidth: BRICK_STROKE_WIDTH
		})
		return b
	}

	getFillColor(): Color {
		return this.headsColor.interpolate(this.tailsColor, this.nbTails / this.nbFlips)
	}

	combinations(): number {
		return binomial(this.nbFlips, this.nbTails)
	}

	getWidth(): number {
		return this.combinations() * this.tailsProbability ** this.nbTails * (1 - this.tailsProbability) ** (this.nbFlips - this.nbTails) * this.widthScale
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		args['fillColor'] = this.getFillColor()
		args['width'] = this.getWidth()
		super.update(args, redraw)
		this.updateDependents()
	}






}