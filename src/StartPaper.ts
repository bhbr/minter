
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'
import { CoinFlipper } from './extensions/creations/CoinFlipper/CoinFlipper'
import { PlayableCoin } from './extensions/creations/CoinFlipper/PlayableCoin'
import { RunningAveragePlotter } from './extensions/creations/CoinFlipper/RunningAveragePlotter'

export class StartPaper extends DemoPaper { }

let TESTING = false

if (TESTING) { runAllTests() }

export const paper = new StartPaper()

let coin = new PlayableCoin({
	anchor: [100, 100]
})
paper.addToContent(coin)

let plotter = new RunningAveragePlotter({
	anchor: [200, 100]
})
paper.addToContent(plotter)
