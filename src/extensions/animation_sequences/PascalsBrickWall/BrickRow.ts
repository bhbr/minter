
import { MGroup } from 'core/mobjects/MGroup'
import { Brick } from './Brick'
import { vertex, vertexAdd } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { TAU } from 'core/constants'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH } from './constants'
import { Color } from 'core/classes/Color'

export class BrickRow extends MGroup {

	nbFlips: number
	bricks: Array<Brick>
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	
	defaults(): object {
		return {
			nbFlips: 1,
			tailsProbability: 0.5,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			bricks: []
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
			//this.addDependency('tailsProbability', brick, 'tailsProbability')
			this.addDependency('headsColor', brick, 'headsColor')
			this.addDependency('tailsColor', brick, 'tailsColor')
			this.add(brick)
		}
		this.positionBricks()
	}

	positionBricks() {
		let anchors = this.brickAnchors()
		for (var i = 0; i <= this.nbFlips; i++) {
			this.bricks[i].update({ anchor: anchors[i] })
		}
	}

	brickAnchors(): Array<vertex> {
		let ret: Array<vertex> = []
		var w: number = 0
		for (var i = 0; i <= this.nbFlips; i++) {
			ret.push([w, 0])
			w += this.bricks[i].getWidth()
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
		this.positionBricks()
	}

	toHistogram() {
		for (var i = 0; i < this.bricks.length; i++) {
			let brick = this.bricks[i]
			let t = brick.transform.copy()
			t.angle = TAU / 4
			t.anchor = [(i - this.bricks.length / 2) * BRICK_HEIGHT + ROW_WIDTH / 2, BRICK_HEIGHT]
			brick.animate({
				transform: t
			}, 1)
		}
	}





}