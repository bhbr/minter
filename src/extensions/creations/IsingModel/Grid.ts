
import { MGroup } from 'core/mobjects/MGroup'
import { Line } from 'core/shapes/Line'
import { log } from 'core/functions/logging'

export class Grid extends MGroup {
	
	cellSize: number
	nbCellsWidth: number
	nbCellsHeight: number
	horizontalGridLines: MGroup
	verticalGridLines: MGroup

	defaults(): object {
		return {
			cellSize: 50,
			nbCellsWidth: 15,
			nbCellsHeight: 10,
			horizontalGridLines: new MGroup(),
			verticalGridLines: new MGroup()
		}
	}

	setup() {
		super.setup()
		this.drawNewGridLines()
		this.add(this.horizontalGridLines)
		this.add(this.verticalGridLines)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['cellSize'] || args['nbCellsWidth'] || args['nbCellsHeight']) {
			this.drawNewGridLines()
		}
	}

	get width(): number { return this.cellSize * this.nbCellsWidth }
	get height(): number { return this.cellSize * this.nbCellsHeight }

	drawNewGridLines() {
		this.drawNewHorizontalGridLines()
		this.drawNewVerticalGridLines()
	}

	drawNewHorizontalGridLines() {
		for (let line of this.horizontalGridLines.submobs) {
			this.horizontalGridLines.remove(line)
		}
		for (let i = 0; i < this.nbCellsHeight + 1; i++) {
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
		for (let i = 0; i < this.nbCellsWidth + 1; i++) {
			let line = new Line({
				startPoint: [i * this.cellSize, 0],
				endPoint: [i * this.cellSize, this.height]
			})
			this.verticalGridLines.add(line)
		}
		this.verticalGridLines.redraw()

	}
	












}