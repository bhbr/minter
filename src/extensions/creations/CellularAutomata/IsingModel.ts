
import { CellularAutomaton, CAState } from './CellularAutomaton'
import { Color } from 'core/classes/Color'

export class IsingModel extends CellularAutomaton {

	temperature: number
	couplingStrength: number

	defaults(): object {
		return {
			temperature: 1,
			couplingStrength: 1,
			colorPalette: {
				"1": Color.red(),
				"-1": Color.blue()
			},
			inputProperties: [
				{ name: 'temperature', type: 'number' },
				{ name: 'couplingStrength', displayName: 'coupling strength', type: 'number' }
			]
		}
	}

	createInitialState(): CAState {
		let initialState: CAState = []
		for (var i = 0; i < this.grid.nbCellsVertical; i++) {
			let stateLine: Array<number> = []
			for (var j = 0; j < this.grid.nbCellsHorizontal; j++) {
				if (Math.random() < 0.5) {
					stateLine.push(1)
				} else {
					stateLine.push(-1)
				}
			}
			initialState.push(stateLine)
		}
		return initialState
	}

	singleStep() {
		let i = Math.floor(Math.random() * this.grid.nbCellsVertical)
		let j = Math.floor(Math.random() * this.grid.nbCellsHorizontal)
		let cell = this.grid.cells[i][j]
		let oldSpin = this.state[i][j]
		var nnSum = 0
		if (i > 1) { nnSum += this.state[i - 1][j] }
		if (i < this.grid.nbCellsVertical - 1) { nnSum += this.state[i + 1][j] }
		if (j > 1) { nnSum += this.state[i][j - 1] }
		if (j < this.grid.nbCellsHorizontal - 1) { nnSum += this.state[i][j + 1] }
		if (oldSpin * nnSum < 0) {
			this.state[i][j] = -oldSpin
		} else {
			let dE = this.couplingStrength * oldSpin * nnSum
			let p = Math.exp(-dE / this.temperature)
			if (Math.random() < p) {
				this.state[i][j] = -oldSpin
			}
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['temperature'] || args['couplingStrength']) {
			args['state'] = this.createInitialState()
		}
		super.update(args, redraw)
	}










	
}