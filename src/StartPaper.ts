
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { runAllTests() }

export const paper = new StartPaper()
