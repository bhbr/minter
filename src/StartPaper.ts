
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Rectangle } from './core/shapes/Rectangle'
import { Color } from './core/classes/Color'
import { log } from './core/functions/logging'
import { Window } from './core/boards/Board'

export const TESTING: boolean = false

export class StartPaper extends DemoPaper { }
export const paper = new StartPaper()

let w = window as Window
