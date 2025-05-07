
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { PascalsBrickWall } from './extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall'
import { factorial, binomial } from './core/functions/math'

export class StartPaper extends DemoPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let p = new PascalsBrickWall()
paper.add(p)
