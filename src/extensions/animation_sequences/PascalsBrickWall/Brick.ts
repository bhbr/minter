
import { Rectangle } from 'core/shapes/Rectangle'
import { HEADS_COLOR, TAILS_COLOR, BASE_BRICK_HEIGHT, BASE_ROW_LENGTH, BRICK_STROKE_WIDTH, BRICK_FILL_OPACITY } from './constants'
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
	anchorMarker: Circle
	scale: number

	defaults(): object {
		return {
			nbFlips: 1,
			nbTails: 0,
			tailsProbability: 0.5,
			scale: 1,
			fillOpacity: BRICK_FILL_OPACITY,
			strokeWidth: BRICK_STROKE_WIDTH,
			anchorMarker: new Circle({
				fillColor: Color.green(),
				fillOpacity: 1,
				radius: 5
			})
		}
	}

	get length(): number {
		return this.width
	}
	set length(newValue: number) {
		this.width = newValue
	}

	get transformAngle(): number {
		return this.transform.angle
	}
	set transformAngle(newValue: number) {
		this.transform.angle = newValue
	}

	setup() {
		super.setup()
		this.anchorMarker.update({
			midpoint: [0, 0]
		})
		this.add(this.anchorMarker)
	}

	nbHeads(): number {
		return this.nbFlips - this.nbTails
	}

	headsProbability(): number {
		return 1 - this.tailsProbability
	}

	leftPartColor(): Color {
		return HEADS_COLOR.interpolate(TAILS_COLOR, this.nbTails / (this.nbFlips + 1))
	}

	rightPartAnchor(): vertex {
		return [this.leftPartWidth(), 0]
	}

	leftPartWidth(): number {
		return this.headsProbability() * this.width
	}

	rightPartWidth(): number {
		return this.tailsProbability * this.width
	}

	rightPartColor(): Color {
		return HEADS_COLOR.interpolate(TAILS_COLOR, (this.nbTails + 1) / (this.nbFlips + 1))
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
		return HEADS_COLOR.interpolate(TAILS_COLOR, this.nbTails / this.nbFlips)
	}

	combinations(): number {
		return binomial(this.nbFlips, this.nbTails)
	}

	probability(): number {
		return this.combinations() * this.tailsProbability ** this.nbTails * this.headsProbability() ** this.nbHeads()
	}

	getWidth(): number {
		return this.probability() * BASE_ROW_LENGTH // * this.scale
	}

	getHeight(): number {
		return BASE_BRICK_HEIGHT / this.scale
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['width'] !== undefined) {
			throw 'Cannot change width of Brick, use unscaledWidth or scale instead'
		}
		if (args['height'] !== undefined) {
			throw 'Cannot change height of Brick, use unscaledHeight or scale instead'
		}
		super.update(args, false)
		args['fillColor'] = args['fillColor'] ?? this.getFillColor()
		args['width'] = this.getWidth()
		args['height'] = this.getHeight()
		super.update(args, redraw)
		this.updateDependents()
	}






}