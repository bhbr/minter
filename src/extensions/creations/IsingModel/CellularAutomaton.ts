
import { Grid } from './Grid'
import { Linkable } from 'core/linkables/Linkable'
import { copy } from 'core/functions/copying'

export type CAState = Array<Array<number>>

export class CellularAutomaton extends Linkable {

	grid: Grid
	state: CAState
	newState: CAState
	colorPalette: object

	defaults(): object {
		return {
			grid: new Grid(),
			state: [],
			newState: [],
			colorPalette: { }
		}
	}
	
	setup() {
		super.setup()
		this.add(this.grid)

		if (this.state.length == 0) {
			this.state = this.createInitialState()
		}
		this.newState = copy(this.state)
		this.updateCells()
	}

	createInitialState(): CAState {
		let initialState: CAState = []
		for (let i = 0; i < this.grid.width; i++) {
			let stateLine: Array<number> = []
			for (let j = 0; j < this.grid.height; j++) {
				stateLine.push(0)
			}
			initialState.push(stateLine)
		}
		return initialState
	}


	evolve(nbSteps: number = 1) {
		this.update({
			state: this.newState
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['state'] !== undefined) {
			this.updateCells()
		}
		super.update(args, redraw)
	}

	updateCells() {
		for (let i = 0; i < this.grid.width; i++) {
			for (let j = 0; j < this.grid.height; j++) {
				let cell = this.grid.cells[i][j]
				cell.update({
					fillColor: this.colorPalette[this.state[i][j].toString()]
				})
			}
		}
	}
}