
import { Grid } from './Grid'
import { Linkable } from 'core/linkables/Linkable'

export type CAState = Array<Array<number>>

export class CellularAutomaton extends Linkable {

	grid: Grid
	state: CAState
	colorPalette: object

	defaults(): object {
		return {
			grid: new Grid(),
			state: [],
			colorPalette: { }
		}
	}
	
	setup() {
		super.setup()
		this.add(this.grid)

		if (this.state.length == 0) {
			this.state = this.createInitialState()
		}
		this.redrawCells()
	}

	createInitialState(): CAState {
		let initialState: CAState = []
		for (var i = 0; i < this.grid.height; i++) {
			let stateLine: Array<number> = []
			for (var j = 0; j < this.grid.width; j++) {
				stateLine.push(0)
			}
			initialState.push(stateLine)
		}
		return initialState
	}

	evolve(nbSteps: number = 1) {
		for (var i = 0; i < nbSteps; i++) {
			this.singleStep()
		}
		// this.update({
		// 	state: this.newState
		// })
		this.redrawCells()
	}

	singleStep() {
		// dynamics implemented in subclass
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['state'] !== undefined && redraw) {
			this.redrawCells()
		}
		super.update(args, redraw)
	}

	redrawCells() {
		for (let i = 0; i < this.grid.height; i++) {
			for (let j = 0; j < this.grid.width; j++) {
				let cell = this.grid.cells[i][j]
				cell.update({
					fillColor: this.colorPalette[this.state[i][j].toString()]
				})
			}
		}
	}
}