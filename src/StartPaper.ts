
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Rectangle } from './core/shapes/Rectangle'
import { Color } from './core/classes/Color'
import { log } from './core/functions/logging'

export const TESTING: boolean = false

export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()

