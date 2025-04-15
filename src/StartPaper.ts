
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

let nbCoins = 10

let row = new PlayableCoinRow({
	anchor: [100, 100],
	nbCoins: nbCoins
})

let hist = new Histogram({
	anchor: [300, 100],
	nbBins: nbCoins + 1
})

paper.addToContent(row)
paper.addToContent(hist)
