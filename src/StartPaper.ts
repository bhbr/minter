
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Grid } from './extensions/creations/IsingModel/Grid'
import { IsingModel } from './extensions/creations/IsingModel/IsingModel'
import { log } from './core/functions/logging'


export const TESTING: boolean = false
export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()

let ising = new IsingModel({
	grid:  new Grid({
		anchor: [100, 100],
		width: 30,
		height: 20,
		cellSize: 20
	}),
	temperature: 0.5,
	couplingStrength: 0.14
})

paper.addToContent(ising)

window.setInterval(ising.evolve.bind(ising), 10)
