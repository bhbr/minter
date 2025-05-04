
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'

export class StartPaper extends CoinFlipPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()
