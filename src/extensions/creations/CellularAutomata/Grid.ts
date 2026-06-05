
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'
import { log } from 'core/functions/logging'
import { GridCell } from './GridCell'

export class Grid extends MGroup {
	
	cellSize: number
	nbCellsHorizontal: number
	nbCellsVertical: number
	horizontalGridLines: MGroup
	verticalGridLines: MGroup
	cells: Array<Array<GridCell>>
	drawGridLines: boolean

	defaults(): object {
		return {
			cellSize: 50,
			nbCellsHorizontal: 3,
			nbCellsVertical: 2,
			horizontalGridLines: new MGroup(),
			verticalGridLines: new MGroup(),
			cells: [],
			drawGridLines: true
		}
	}

	mutabilities(): object {
		return {
			cellSize: 'on_init',
			nbCellsHorizontal: 'on_init',
			nbCellsVertical: 'on_init',
			horizontalGridLines: 'never',
			verticalGridLines: 'never',
			cells: 'never'
		}
	}

	setup() {
		super.setup()
		if (this.drawGridLines) {
			this.drawNewGridLines()
			this.add(this.horizontalGridLines)
			this.add(this.verticalGridLines)
		}

		for (var i = 0; i < this.nbCellsVertical; i++) {
			let cellLine: Array<GridCell> = []
			for (var j = 0; j < this.nbCellsHorizontal; j++) {
				let cell = new GridCell({
					anchor: [j * this.cellSize, i * this.cellSize],
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
		for (var i = 0; i < this.nbCellsVertical + 1; i++) {
			let line = new Line({
				startPoint: [0, i * this.cellSize],
				endPoint: [this.nbCellsHorizontal, i * this.cellSize]
			})
			this.horizontalGridLines.add(line)
		}
		this.horizontalGridLines.redraw()
	}

	drawNewVerticalGridLines() {
		for (let line of this.verticalGridLines.submobs) {
			this.verticalGridLines.remove(line)
		}
		for (var j = 0; j < this.nbCellsHorizontal + 1; j++) {
			let line = new Line({
				startPoint: [j * this.cellSize, 0],
				endPoint: [j * this.cellSize, this.nbCellsVertical]
			})
			this.verticalGridLines.add(line)
		}
		this.verticalGridLines.redraw()

	}
	
	synchronizeUpdateArguments(args: object = {}) {
		let w = args['nbCellsHorizontal']
		let c = args['cellSize'] ?? this.cellSize
		if (w) {
			args['width'] =  c * w
		}
		let h = args['nbCellsVertical']
		if (h) {
			args['height'] = c * h
		}
		return args
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (this.drawGridLines && (args['cellSize'] || args['width'] || args['height'])) {
			this.drawNewGridLines()
		}
	}











}