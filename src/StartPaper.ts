
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'
import { CoinFlipper } from './extensions/creations/CoinFlipper/CoinFlipper'
import { Histogram } from './extensions/creations/CoinFlipper/Histogram'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { runAllTests() }

export const paper = new StartPaper()

let flipper = new CoinFlipper({
	anchor: [100, 100],
	nbCoins: 6
})
paper.addToContent(flipper)

let histogram = new Histogram({
	anchor: [400, 100],
	frameWidth: 800,
	frameHeight: 500
})
paper.addToContent(histogram)