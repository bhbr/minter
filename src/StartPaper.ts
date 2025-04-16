
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'
import { NumberListBox } from './extensions/creations/math/ValueBox/NumberListBox'

export class StartPaper extends CoinFlipPaper { }

let TESTING = false

if (TESTING) { runAllTests() }

export const paper = new StartPaper()

let box = new NumberListBox({
	value: [1, 2, 7, 4],
	anchor: [100, 100]
})
paper.addToContent(box)