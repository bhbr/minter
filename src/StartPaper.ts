
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Grid } from './extensions/creations/CellularAutomata/Grid'
import { IsingModel } from './extensions/creations/CellularAutomata/IsingModel'
import { GameOfLife } from './extensions/creations/CellularAutomata/GameOfLife'
import { log } from './core/functions/logging'


export const TESTING: boolean = false
export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()
