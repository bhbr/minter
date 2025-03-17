
import { CellularAutomaton } from './CellularAutomaton'
import { Color } from 'core/classes/Color'
import { CAState } from './CellularAutomaton'
import { log } from 'core/functions/logging'
import { deepCopy } from 'core/functions/copying'

export class GameOfLife extends CellularAutomaton {

	newState: CAState

	defaults() {
		return {
			newState: [],
			colorPalette: {
				"0": Color.blue(),
				"1": Color.red()
			}
		}
	}

	setup() {
		super.setup()

		for (var i = 0; i < this.grid.height; i++) {
			let stateLine: Array<number> = []
			for (var j = 0; j < this.grid.width; j++) {
				stateLine.push(0)
			}
			this.newState.push(stateLine)
		}

	}

	createInitialState(): CAState {
		let initialState: CAState = []
		for (var i = 0; i < this.grid.height; i++) {
			let stateLine: Array<number> = []
			for (var j = 0; j < this.grid.width; j++) {
				if (Math.random() < 0.5) {
					stateLine.push(1)
				} else {
					stateLine.push(0)
				}
				stateLine.push(0)
			}
			initialState.push(stateLine)
		}

		return initialState
	}

	
	singleStep() {
		for (var i = 0; i < this.grid.height; i++) {
			for (var j = 0; j < this.grid.width; j++) {
				var nbNeighbours = 0

				if (i > 1 && j > 1)                                      { nbNeighbours += this.state[i - 1][j - 1] }
				if (i > 1)                                               { nbNeighbours += this.state[i - 1][j] }
				if (i > 1 && j < this.grid.width - 1)                    { nbNeighbours += this.state[i - 1][j + 1] }

				if (j > 1)                                               { nbNeighbours += this.state[i][j - 1] }
				if (j < this.grid.width - 1)                             { nbNeighbours += this.state[i][j + 1] }

				if (i < this.grid.height - 1 && j > 1)                   { nbNeighbours += this.state[i + 1][j - 1] }
				if (i < this.grid.height - 1)                            { nbNeighbours += this.state[i + 1][j] }
				if (i < this.grid.height - 1 && j < this.grid.width - 1) { nbNeighbours += this.state[i + 1][j + 1] }

				if (this.state[i][j] == 0 && nbNeighbours == 3) {
					this.newState[i][j] = 1
				} else if (this.state[i][j] == 1 && (nbNeighbours == 2 || nbNeighbours == 3)) {
					this.newState[i][j] = 1
				} else {
					this.newState[i][j] = 0
				}
			}
		}

		for (var i = 0; i < this.grid.height; i++) {
			for (var j = 0; j < this.grid.width; j++) {
				this.state[i][j] = this.newState[i][j]
			}
		}
	}

}
