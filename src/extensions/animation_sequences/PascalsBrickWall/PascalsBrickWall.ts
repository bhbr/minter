
import { AnimationSequence } from 'core/animation_sequence/AnimationSequence'
import { BrickRow } from './BrickRow'
import { Linkable } from 'core/linkables/Linkable'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT, ROW_WIDTH } from './constants'
import { vertexTranslatedBy } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { Line } from 'core/shapes/Line'
import { Color } from 'core/classes/Color'
import { SimpleButton } from 'core/mobjects/SimpleButton'

export class PascalsBrickWall extends Linkable {

	nbFlips: number
	animationSubstep: number
	rows: Array<BrickRow>
	duplicatedRow?: BrickRow
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	nextSubstepButton: SimpleButton

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
				anchor: [0.5 * (ROW_WIDTH - 50), BRICK_HEIGHT + 60],
				text: ">"
			})
		}
	}

	setup() {
		super.setup()
		this.add(this.nextSubstepButton)
		this.nextSubstepButton.action = this.animateNextSubstep.bind(this)

		for (var i = 1; i <= this.nbFlips; i++) {
			let row = new BrickRow({
				anchor: [0, BRICK_HEIGHT * i],
				nbFlips: i,
				tailsProbability: this.tailsProbability,
				headsColor: this.headsColor,
				tailsColor: this.tailsColor
			})
			this.addDependency('tailsProbability', row, 'tailsProbability')
			this.addDependency('headsColor', row, 'headsColor')
			this.addDependency('tailsColor', row, 'tailsColor')
			this.add(row)
			this.rows.push(row)
		}
	}

	lastRow(): BrickRow {
		return this.rows[this.nbFlips - 1]
	}

	duplicateLastRow() {
		this.duplicatedRow = new BrickRow({
			nbFlips: this.nbFlips,
			tailsProbability: this.tailsProbability,
			anchor: [0, this.nbFlips * BRICK_HEIGHT],
			visible: false
		})
		this.add(this.duplicatedRow)
		this.lastRow().update({
			opacity: 0.2
		})
		this.moveToTop(this.lastRow())
		this.duplicatedRow.view.show()
		this.duplicatedRow.animate({
			anchor: vertexTranslatedBy(this.duplicatedRow.anchor, [0, BRICK_HEIGHT])
		}, 1)
		this.animationSubstep += 1
		this.nextSubstepButton.animate({
			anchor: [0.5 * (ROW_WIDTH - 50), (this.nbFlips + 1) * BRICK_HEIGHT + 60],
		}, 1)
	}

	splitBricks() {
		let splitLines: Array<Line> = []
		for (var i = 0; i < this.duplicatedRow.bricks.length; i++) {
			let x = this.duplicatedRow.bricks[i].anchor[0] + this.duplicatedRow.bricks[i].midX()
			let line = new Line({
				startPoint: [x, 0],
				endPoint: [x, 0]
			})
			line.view.div.style.strokeDasharray = "4"
			splitLines.push(line)
			this.duplicatedRow.add(line)
			line.animate({
				endPoint: [x, BRICK_HEIGHT]
			}, 1)
		}
		this.animationSubstep += 1
	}

	fadeInNextRow() {
		this.rows[this.rows.length - 1].animate({
			opacity: 0.2
		}, 1)
		this.nbFlips += 1
		let nextRow = new BrickRow({
			nbFlips: this.nbFlips,
			tailsProbability: this.tailsProbability,
			anchor: [0, this.nbFlips * BRICK_HEIGHT],
			opacity: 0
		})
		this.rows.push(nextRow)
		this.add(nextRow)
		nextRow.animate({
			opacity: 1
		}, 1)
		window.setTimeout(function() {
			this.remove(this.duplicatedRow)
			this.duplicatedRow = null
		}.bind(this), 1000)
		this.animationSubstep = 0
	}

	animateSplitAndMerge() {
		this.duplicateLastRow()
		window.setTimeout(this.splitBricks.bind(this), 1000)
		window.setTimeout(this.fadeInNextRow.bind(this), 2000)
		this.nbFlips += 1
	}

	fadeOutAllButLastRow() {
		for (var i = 0; i < this.nbFlips - 1; i++) {
			for (let brick of this.rows[i].bricks) {
				brick.animate({
					opacity: 0.2
				}, 1)
			}
		}
	}

	animateNextSubstep() {
		switch (this.animationSubstep) {
			case 0:
				this.duplicateLastRow()
				break
			case 1:
				this.splitBricks()
				break
			case 2:
				this.fadeInNextRow()
				break
			default:
				break
		}
	}



	
}