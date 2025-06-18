
import { MGroup } from 'core/mobjects/MGroup'
import { Brick } from './Brick'
import { vertex, vertexAdd } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { TAU } from 'core/constants'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH, FAST_ANIMATION_DURATION, SLOW_ANIMATION_DURATION } from './constants'
import { Color } from 'core/classes/Color'

type PresentationForm = 'row' | 'histogram' | 'centered-histogram'

export class Partition extends MGroup {

	nbFlips: number
	bricks: Array<Brick>
	leftPartBricks: Array<Brick>
	rightPartBricks: Array<Brick>
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	presentationForm: PresentationForm
	
	defaults(): object {
		return {
			nbFlips: 1,
			tailsProbability: 0.5,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			bricks: [],
			leftPartBricks: [],
			rightPartBricks: [],
			presentationForm: 'row'
		}
	}

	setup() {
		super.setup()
		for (var i = 0; i <= this.nbFlips; i++) {
			let brick = new Brick({
				nbFlips: this.nbFlips,
				nbTails: i,
				tailsProbability: this.tailsProbability,
				headsColor: this.headsColor,
				tailsColor: this.tailsColor,
			})
			this.bricks.push(brick)
			this.addDependency('tailsProbability', brick, 'tailsProbability')
			this.addDependency('headsColor', brick, 'headsColor')
			this.addDependency('tailsColor', brick, 'tailsColor')
			this.add(brick)
		}
		this.positionBricks()
	}

	positionBricks() {
		let anchors = this.brickAnchors(this.presentationForm)
		let angle = this.brickAngle(this.presentationForm)
		for (var i = 0; i <= this.nbFlips; i++) {
			this.bricks[i].update({
				anchor: anchors[i],
				transformAngle: angle
			})
		}
	}

	animateToForm(newForm: PresentationForm) {
		let anchors = this.brickAnchors(newForm)
		let angle = this.brickAngle(newForm)
		for (var i = 0; i <= this.nbFlips; i++) {
			this.bricks[i].animate({
				anchor: anchors[i],
				transformAngle: angle
			}, SLOW_ANIMATION_DURATION)
		}
		
	}

	brickAngle(form: PresentationForm): number {
		switch (form) {
		case 'row':
			return 0
		default:
			return TAU / 4
		}
	}

	brickAnchors(form: PresentationForm): Array<vertex> {
		switch (form) {
		case 'row':
			return this.brickAnchorsForRow()
		case 'histogram':
			return this.brickAnchorsForHistogram()
		case 'centered-histogram':
			return this.brickAnchorsForCenteredHistogram()
		default:
			return []
		}
	}

	brickAnchorsForRow(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, 0])
			w += this.bricks[i].getWidth()
		}
		return ret
	}

	brickAnchorsForHistogram(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, 0])
			w += BRICK_HEIGHT
		}
		return ret
	}

	brickAnchorsForCenteredHistogram(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, this.bricks[i].getWidth() / 2])
			w += BRICK_HEIGHT
		}
		return ret
	}

	update(args: object = {}, redraw: boolean = false) {
		super.update(args, redraw)
		let newP = args['tailsProbability']
		if (newP !== undefined && newP >= 0 && newP <= 1) {
			for (let brick of this.bricks) {
				brick.update({
					tailsProbability: newP
				})
			}
		}
		//this.positionBricks()
	}


	// toHistogram() {
	// 	switch (this.presentationForm) {
	// 	case 'row':
	// 		this.wallToHistogram()
	// 		return
	// 	case 'histogram':
	// 		return
	// 	case 'centered-histogram':
	// 		this.centeredHistogramToHistogram()
	// 		return
	// 	default:
	// 		return
	// 	}
	// }

	// wallToHistogram() {
	// 	for (var i = 0; i < this.bricks.length; i++) {
	// 		let brick = this.bricks[i]
	// 		let t = brick.transform.copy()
	// 		t.angle = TAU / 4
	// 		t.anchor = [(i - this.bricks.length / 2) * BRICK_HEIGHT + ROW_WIDTH / 2, BRICK_HEIGHT]
	// 		brick.animate({
	// 			transform: t
	// 		}, 1)
	// 	}
	// }

	// centeredHistogramToHistogram() {
	// 	for (var i = 0; i < this.bricks.length; i++) {
	// 		let brick = this.bricks[i]
	// 		brick.animate({
	// 			anchor: [i * BRICK_HEIGHT, ]
	// 		}, FAST_ANIMATION_DURATION)
	// 	}
	// }




}