
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Grid } from './extensions/creations/IsingModel/Grid'
import { log } from './core/functions/logging'

export const TESTING: boolean = false
export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()

let grid = new Grid({
	anchor: [100, 100],
	cellSize: 100,
	nbCellsWidth: 3,
	nbCellsHeight: 2	
})


paper.addToContent(grid)