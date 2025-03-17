
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Grid } from './extensions/creations/CellularAutomata/Grid'
import { IsingModel } from './extensions/creations/CellularAutomata/IsingModel'
import { GameOfLife } from './extensions/creations/CellularAutomata/GameOfLife'
import { log } from './core/functions/logging'


export const TESTING: boolean = false
export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()

let life = new GameOfLife({
	grid:  new Grid({
		anchor: [100, 100],
		width: 100,
		height: 75,
		cellSize: 10,
		drawGridLines: false
	})
})

paper.addToContent(life)
window.setInterval(life.evolve.bind(life), 1000)
