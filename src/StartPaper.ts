
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'
import { PlayableCoinRow } from './extensions/creations/CoinFlipper/PlayableCoinRow'
import { Histogram } from './extensions/creations/CoinFlipper/Histogram'

export class StartPaper extends CoinFlipPaper { }

let TESTING = false

if (TESTING) { runAllTests() }

export const paper = new StartPaper()

let nbCoins = 12

let coinRow = new PlayableCoinRow({
	anchor: [100, 100],
	nbCoins: nbCoins
})
paper.addToContent(coinRow)

let hist = new Histogram({
	anchor: [500, 200],
	frameWidth: 800,
	frameHeight: 500,
	nbBins: nbCoins + 1
})
paper.addToContent(hist)