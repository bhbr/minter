
import { AnimationSequence } from 'core/animation_sequence/AnimationSequence'
import { Partition } from './Partition'
import { Brick, LabelShower } from './Brick'
import { DetailedBrickLabel } from './DetailedBrickLabel'
import { Linkable } from 'core/linkables/Linkable'
import { HEADS_COLOR, TAILS_COLOR, BASE_BRICK_HEIGHT, BASE_ROW_LENGTH, BRICK_STROKE_WIDTH, SLOW_ANIMATION_DURATION, FAST_ANIMATION_DURATION } from './constants'
import { vertexTranslatedBy } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { Line } from 'core/shapes/Line'
import { Color } from 'core/classes/Color'
import { SimpleButton } from 'core/ui/SimpleButton'

export class PascalsBrickWall extends Linkable implements LabelShower {

	nbFlips: number
	animationSubstep: number
	rows: Array<Partition>
	duplicatedRow?: Partition
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	nextSubstepButton: SimpleButton
	nextStepButton: SimpleButton
	histogramButton: SimpleButton
	nextRow: Partition | null
	brickLabel: DetailedBrickLabel
	labelledBrick: Brick | null

	defaults(): object {
		return {
			nbFlips: 1,
			animationSubstep: 0,
			rows: [],
			duplicatedRow: null,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			tailsProbability: 0.5,
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' },
			],
			nextSubstepButton: new SimpleButton({
				anchor: [0.5 * (BASE_ROW_LENGTH - 50), BASE_BRICK_HEIGHT + 10],
				text: ">"
			}),
			nextStepButton: new SimpleButton({
				anchor: [0.5 * (BASE_ROW_LENGTH - 50) + 60, BASE_BRICK_HEIGHT + 10],
				text: ">>"
			}),
			histogramButton: new SimpleButton({
				anchor: [800, BASE_BRICK_HEIGHT + 10],
				text: "H"
			}),
			nextRow: null,
			brickLabel: new DetailedBrickLabel(),
			labelledBrick: null
		}
	}

	setup() {
		super.setup()
		this.controls.add(this.nextSubstepButton)
		this.nextSubstepButton.action = this.animateNextSubstep.bind(this)
		this.controls.add(this.nextStepButton)
		this.nextStepButton.action = this.animateNextStep.bind(this)

		for (var i = 1; i <= this.nbFlips; i++) {
			let row = new Partition({
				anchor: [0, -BASE_BRICK_HEIGHT * (i - 1)],
				nbFlips: i,
				tailsProbability: this.tailsProbability,
				headsColor: this.headsColor,
				tailsColor: this.tailsColor
			})
			for (let b of row.bricks) {
				b.labelShower = this
			}
			row.remove(row.controls)
			this.addDependency('tailsProbability', row, 'tailsProbability')
			this.addDependency('headsColor', row, 'headsColor')
			this.addDependency('tailsColor', row, 'tailsColor')
			this.add(row)
			this.rows.push(row)
			this.brickLabel.view.hide()
			this.add(this.brickLabel)
		}
	}

	lastRow(): Partition {
		return this.rows[this.nbFlips - 1]
	}

	temporarilyDisableButtons(duration: number = 1) {
		this.nextSubstepButton.disable()
		this.nextStepButton.disable()
		this.histogramButton.disable()
		window.setTimeout( function() {
			this.nextSubstepButton.enable()
			this.nextStepButton.enable()
			this.histogramButton.enable()
		}.bind(this), duration * 1000)
	}

	duplicateLastRow(duration: number = 1) {
		this.duplicatedRow = new Partition({
			nbFlips: this.nbFlips,
			tailsProbability: this.tailsProbability,
			visible: false
		})
		this.duplicatedRow.remove(this.duplicatedRow.controls)
		this.add(this.duplicatedRow)
		// this.lastRow().update({
		// 	opacity: 0.5
		// })
		this.moveToTop(this.lastRow())
		this.duplicatedRow.view.show()
		for (var i = 0; i < this.rows.length; i++) {
			this.rows[i].animate({
				anchor: [0, -(this.nbFlips - i) * BASE_BRICK_HEIGHT]
			}, duration)
		}
		this.temporarilyDisableButtons()
		this.animationSubstep += 1
	}

	splitBricks(duration: number = 1) {
		let splitLines: Array<Line> = []
		for (var i = 0; i < this.duplicatedRow.bricks.length; i++) {
			let x = this.duplicatedRow.bricks[i].anchor[0] + this.duplicatedRow.bricks[i].midX()
			let line = new Line({
				startPoint: [x, 0],
				endPoint: [x, 0],
				strokeWidth: BRICK_STROKE_WIDTH
			})
			splitLines.push(line)
			this.duplicatedRow.add(line)
			line.animate({
				endPoint: [x, BASE_BRICK_HEIGHT]
			}, duration)
		}
		this.temporarilyDisableButtons()
		this.animationSubstep += 1
	}

	mergeBricks(duration: number = 1) {
		this.nextRow = new Partition({
			nbFlips: this.nbFlips + 1,
			tailsProbability: this.tailsProbability,
			opacity: 0
		})
		for (let b of this.nextRow.bricks) {
			b.labelShower = this
		}
		this.nextRow.remove(this.nextRow.controls)
		for (let brick of this.nextRow.bricks) {
			brick.update({ fillOpacity: 0 })
		}
		this.add(this.nextRow)
		this.nextRow.animate({ opacity: 1 }, duration)
		for (let brick of this.duplicatedRow.bricks) {
			brick.animate({ strokeWidth: 0 }, duration)
		}
		this.temporarilyDisableButtons()
		this.animationSubstep += 1
	}

	fadeInNextRow(duration: number = 1) {
		this.rows[this.rows.length - 1].animate({
			fillOpacity: 1
		}, duration)
		this.moveToTop(this.nextRow)
		for (let brick of this.nextRow.bricks) {
			brick.animate({ fillOpacity: 1 }, duration)
		}
		this.nbFlips += 1
		this.rows.push(this.nextRow)
		window.setTimeout(function() {
			this.remove(this.duplicatedRow)
			this.duplicatedRow = null
		}.bind(this), 1000 * duration)
		this.temporarilyDisableButtons()
		this.animationSubstep = 0
	}

	animateNextSubstep() {
		if (this.labelledBrick) {
			this.toggleLabelOnBrick(this.labelledBrick)
		}
		switch (this.animationSubstep) {
			case 0:
				this.duplicateLastRow(SLOW_ANIMATION_DURATION)
				break
			case 1:
				this.splitBricks(SLOW_ANIMATION_DURATION)
				break
			case 2:
				this.mergeBricks(SLOW_ANIMATION_DURATION)
				break
			case 3:
				this.fadeInNextRow(SLOW_ANIMATION_DURATION)
				break
			default:
				break
		}
	}

	animateNextStep() {
		if (this.labelledBrick) {
			this.toggleLabelOnBrick(this.labelledBrick)
		}
		switch (this.animationSubstep) {
			case 0:
				this.duplicateLastRow(SLOW_ANIMATION_DURATION)
				window.setTimeout(function() { this.splitBricks(SLOW_ANIMATION_DURATION) }.bind(this), 1000 * SLOW_ANIMATION_DURATION)
				window.setTimeout(function() { this.mergeBricks(SLOW_ANIMATION_DURATION) }.bind(this), 2000 * SLOW_ANIMATION_DURATION)
				window.setTimeout(function() { this.fadeInNextRow(SLOW_ANIMATION_DURATION) }.bind(this), 3000 * SLOW_ANIMATION_DURATION)
				break
			case 1:
				this.splitBricks(SLOW_ANIMATION_DURATION)
				window.setTimeout(function() { this.mergeBricks(SLOW_ANIMATION_DURATION) }.bind(this), 1000 * SLOW_ANIMATION_DURATION)
				window.setTimeout(function() { this.fadeInNextRow(SLOW_ANIMATION_DURATION) }.bind(this), 2000 * SLOW_ANIMATION_DURATION)
				break
			case 2:
				this.mergeBricks(SLOW_ANIMATION_DURATION)
				window.setTimeout(function() { this.fadeInNextRow(SLOW_ANIMATION_DURATION) }.bind(this), 1000 * SLOW_ANIMATION_DURATION)
				break
			case 3:
				this.fadeInNextRow(SLOW_ANIMATION_DURATION)
				break
			default:
				break
		}
	}

	finishStep() {
		if (this.animationSubstep > 0) {
			this.animateNextStep()
		}
	}

	update(args: object = {}, redraw: boolean = false) {
		super.update(args, redraw)
		let newP = args['tailsProbability']
		if (newP === undefined || newP < 0 || newP > 1) { return }
		for (let row of this.rows) {
			row.update({
				tailsProbability: newP
			})
		}
		if (this.duplicatedRow) {
			this.duplicatedRow.update({
				tailsProbability: newP
			})
		}

	}

	wallToHistogram() {
		this.finishStep()
		for (let row of this.rows) {
			if (row == this.lastRow()) { break }
			row.animate({ opacity: 0 }, SLOW_ANIMATION_DURATION)
		}
		//this.lastRow().toHistogram()
	}

	centeredHistogramToHistogram() {
		//this.lastRow().centeredHistogramToHistogram()
	}

	getRow(nbFlips: number): Partition {
		return this.rows[nbFlips - 1]
	}

	getBrick(nbFlips: number, nbTails: number): Brick {
		return this.getRow(nbFlips).bricks[nbTails]
	}

	toggleLabelOnBrick(brick: Brick) {

		let row = this.getRow(brick.nbFlips)

		if (this.labelledBrick) {
			// we were highlighting some brick already
			this.labelledBrick.update({
				fillColor: this.labelledBrick.getFillColor()
			})
			if (brick == this.labelledBrick) {
				// tapped on highlighted brick to make the label disappear
				this.brickLabel.view.hide()
				this.labelledBrick = null
				return
			}
			// tapped on a new brick
			this.brickLabel.update({
				nbHeads: brick.nbHeads(),
				nbTails: brick.nbTails,
				anchor: [
					row.anchor[0] + brick.anchor[0] + brick.view.frame.midX() - this.brickLabel.frameWidth / 2,
					row.anchor[1] + brick.anchor[1] + brick.view.frame.midY() - this.brickLabel.frameHeight / 2
				]
			})
			brick.update({
				fillColor: brick.getFillColor().brighten(0.65)
			})
			this.labelledBrick = brick
		} else {
			// no brick was previously highlighted
			this.brickLabel.update({
				nbHeads: brick.nbHeads(),
				nbTails: brick.nbTails,
				anchor: [
					row.anchor[0] + brick.anchor[0] + brick.view.frame.midX() - this.brickLabel.frameWidth / 2,
					row.anchor[1] + brick.anchor[1] + brick.view.frame.midY() - this.brickLabel.frameHeight / 2
				]
			})
			brick.update({
				fillColor: brick.getFillColor().brighten(0.65)
			})
			this.brickLabel.view.show()
			this.labelledBrick = brick
		}

		this.moveToTop(this.brickLabel)

	}


















	
}