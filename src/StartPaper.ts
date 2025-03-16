
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Grid } from './extensions/creations/IsingModel/Grid'
import { GridCell } from './extensions/creations/IsingModel/GridCell'
import { log } from './core/functions/logging'
import { Square } from './core/shapes/Square'


export const TESTING: boolean = false
export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()

let grid = new Grid({
	anchor: [100, 100],
	width: 25,
	height: 15,
	cellSize: 30
})
paper.addToContent(grid)

//window.setInterval(grid.evolveState.bind(grid), 100)
