
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'
import { log } from 'core/functions/logging'
import { GridCell } from './GridCell'

export class Grid extends MGroup {
	
	cellSize: number
	width: number
	height: number
	horizontalGridLines: MGroup
	verticalGridLines: MGroup
	cells: Array<Array<GridCell>>

	defaults(): object {
		return {
			cellSize: 50,
			width: 3,
			height: 2,
			horizontalGridLines: new MGroup(),
			verticalGridLines: new MGroup(),
			cells: []
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
	
	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['cellSize'] || args['width'] || args['height']) {
			this.drawNewGridLines()
		}
	}











}