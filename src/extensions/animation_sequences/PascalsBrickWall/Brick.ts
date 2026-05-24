
import { Rectangle } from 'core/shapes/Rectangle'
import { HEADS_COLOR, TAILS_COLOR, BASE_BRICK_HEIGHT, BASE_ROW_LENGTH, BRICK_STROKE_WIDTH, BRICK_FILL_OPACITY } from './constants'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { binomial } from 'core/functions/math'
import { vertex, vertexAdd } from 'core/functions/vertex'
import { Line } from 'core/shapes/Line'
import { Circle } from 'core/shapes/Circle'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export interface LabelShower {
	toggleLabelOnBrick: (Brick) => void
}

export class Brick extends Rectangle {
	
	nbFlips: number
	nbTails: number
	tailsProbability: number
	anchorMarker: Circle
	labelShower: LabelShower

	defaults(): object {
		return {
			nbFlips: 1,
			nbTails: 0,
			tailsProbability: 0.5,
			fillOpacity: BRICK_FILL_OPACITY,
			strokeWidth: BRICK_STROKE_WIDTH,
			anchorMarker: new Circle({
				fillColor: Color.green(),
				fillOpacity: 1,
				radius: 5
			}),
			screenEventHandler: ScreenEventHandler.Self
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
		//this.add(this.anchorMarker)
		// this.label.update({
		// 	nbHeads: this.nbHeads(),
		// 	nbTails: this.nbTails,
		// 	anchor: [this.width / 2 - this.label.width / 2, this.height / 2 - this.label.frameHeight / 2]
		// })
		// this.add(this.label)
		// this.label.view.hide()
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
			fillColor: this.getFillColor(),
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
		return this.probability() * BASE_ROW_LENGTH
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		args['fillColor'] = args['fillColor'] ?? this.getFillColor()
		args['width'] = this.getWidth()
		super.update(args, redraw)
		this.updateDependents()
	}

	onTap(e: ScreenEvent) {
		this.labelShower.toggleLabelOnBrick(this)
	}




}