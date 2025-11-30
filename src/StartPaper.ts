
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { AllTests } from './_tests/allTests'
import { MathQuillFormula } from './extensions/creations/MathQuillFormula/MathQuillFormula'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true
if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let mq = new MathQuillFormula({
	anchor: [100, 100],
	frameWidth: 300,
	frameHeight: 100
})

paper.addToContent(mq)