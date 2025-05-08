
import { AnimationSequence } from 'core/animation_sequence/AnimationSequence'
import { BrickRow } from './BrickRow'
import { Linkable } from 'core/linkables/Linkable'
import { HEADS_COLOR, TAILS_COLOR, BRICK_HEIGHT } from './constants'
import { vertexTranslatedBy } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { Line } from 'core/shapes/Line'
import { Color } from 'core/classes/Color'

export class PascalsBrickWall extends Linkable {

	nbFlips: number
	rows: Array<BrickRow>
	duplicatedRow?: BrickRow
	tailsProbability: number
	headsColor: Color
	tailsColor: Color

	defaults(): object {
		return {
			nbFlips: 10,
			rows: [],
			duplicatedRow: null,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			tailsProbability: 0.5,
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' },
			]
		}
	}

	setup() {
		super.setup()
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
		this.moveToTop(this.lastRow())
		this.duplicatedRow.view.show()
		this.duplicatedRow.animate({
			anchor: vertexTranslatedBy(this.duplicatedRow.anchor, [0, BRICK_HEIGHT])
		}, 1)
	}

	splitBricks() {
		let nextRow = new BrickRow({
			nbFlips: this.nbFlips,
			tailsProbability: this.tailsProbability,
			anchor: [0, this.nbFlips * BRICK_HEIGHT],
			opacity: 0
		})
		this.add(nextRow)
		this.rows.push(nextRow)
		let splitLines: Array<Line> = []
		for (var i = 1; i <= this.nbFlips; i++) {
			let x = nextRow.bricks[i].anchor[0]
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
	}

	fadeInNextRow() {
		this.rows[this.rows.length - 1].animate({
			opacity: 1
		}, 1)
		window.setTimeout(function() {
			this.remove(this.duplicatedRow)
			this.duplicatedRow = null
		}.bind(this), 1000)
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



	
}