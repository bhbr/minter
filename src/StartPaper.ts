
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'
import { PlayableCoinRow } from './extensions/creations/CoinFlipper/PlayableCoinRow'

export class StartPaper extends DemoPaper { }

let TESTING = false

if (TESTING) { runAllTests() }

export const paper = new StartPaper()

let coinRow = new PlayableCoinRow({
	anchor: [100, 100]
})
paper.addToContent(coinRow)