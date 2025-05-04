
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { WheelColorSample } from './extensions/creations/ColorSample/WheelColorSample'

export class StartPaper extends CoinFlipPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let s = new WheelColorSample({
	anchor: [300, 300]
})
paper.addToContent(s)