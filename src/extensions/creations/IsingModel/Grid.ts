
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'
import { log } from 'core/functions/logging'
import { GridCell } from './GridCell'
import { Color } from 'core/classes/Color'

export class Grid extends MGroup {
	
	cellSize: number
	width: number
	height: number
	horizontalGridLines: MGroup
	verticalGridLines: MGroup
	cells: Array<Array<GridCell>>
	state: Array<Array<number>>
	colorPalette: object

	defaults(): object {
		return {
			cellSize: 50,
			width: 3,
			height: 2,
			horizontalGridLines: new MGroup(),
			verticalGridLines: new MGroup(),
			cells: [],
			state: [],
			colorPalette: {
				"1": Color.red(),
				"-1": Color.blue()
			}
		}
	}

	mutabilities(): object {
		return {
			cellSize: 'on_init',
			width: 'on_init',
			height: 'on_init',
			horizontalGridLines: 'never',
			verticalGridLines: 'never',
			cells: 'never'
		}
	}

	setup() {
		super.setup()
		this.drawNewGridLines()
		this.add(this.horizontalGridLines)
		this.add(this.verticalGridLines)

		for (let i = 0; i < this.width; i++) {
			let cellLine: Array<GridCell> = []
			for (let j = 0; j < this.height; j++) {
				let cell = new GridCell({
					anchor: [i * this.cellSize, j * this.cellSize],
					sidelength: this.cellSize
				})
				this.add(cell)
				cellLine.push(cell)
			}
			this.cells.push(cellLine)
		}

		for (let i = 0; i < this.width; i++) {
			let stateLine: Array<number> = []
			for (let j = 0; j < this.height; j++) {
				stateLine.push(1)
			}
			this.state.push(stateLine)
		}

		this.updateCells()
	}

	evolveState() {
		this.update({
			state: this.nextState(this.state)
		})
	}

	nextState(oldState: Array<Array<number>>): Array<Array<number>> {
		let newState: Array<Array<number>> = []
		for (let i = 0; i < this.width; i++) {
			let newLine: Array<number> = []
			for (let j = 0; j < this.height; j++) {
				if (Math.random() < 0.5) {
					newLine.push(1)
				} else {
					newLine.push(-1)
				}
			}
			newState.push(newLine)
		}
		return newState
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['cellSize'] || args['width'] || args['height']) {
			this.drawNewGridLines()
		}
		if (args['state']) {
			this.updateCells()
		}
	}

	updateCells() {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				let cell = this.cells[i][j]
				cell.update({
					fillColor: this.colorPalette[this.state[i][j].toString()]
				})
			}
		}

	}

	drawNewGridLines() {
		this.drawNewHorizontalGridLines()
		this.drawNewVerticalGridLines()
	}

	drawNewHorizontalGridLines() {
		for (let line of this.horizontalGridLines.submobs) {
			this.horizontalGridLines.remove(line)
		}
		for (let i = 0; i < this.height + 1; i++) {
			let line = new Line({
				startPoint: [0, i * this.cellSize],
				endPoint: [this.width, i * this.cellSize]
			})
			this.horizontalGridLines.add(line)
		}
		this.horizontalGridLines.redraw()
	}

	drawNewVerticalGridLines() {
		for (let line of this.verticalGridLines.submobs) {
			this.verticalGridLines.remove(line)
		}
		for (let i = 0; i < this.width + 1; i++) {
			let line = new Line({
				startPoint: [i * this.cellSize, 0],
				endPoint: [i * this.cellSize, this.height]
			})
			this.verticalGridLines.add(line)
		}
		this.verticalGridLines.redraw()

	}
	












}