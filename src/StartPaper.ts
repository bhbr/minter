
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { NumberListBox } from './core/boxes/lists/NumberListBox'
import { ListBox } from './core/boxes/lists/ListBox'
import { Board } from './core/boards/Board'
import { AverageBox } from './core/boxes/list_functions/ListFunctionBox'
import { AddBox } from './core/boxes/binary_operators/BinaryOperatorBox'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let box = new NumberListBox({
	anchor: [200, 200],
	value: [1, 2, 3, 4]
})
paper.addToContent(box)

let avg = new AverageBox({
	anchor: [400, 200]
})
paper.addToContent(avg)

let sum = new AddBox({
	anchor: [400, 400]
})
paper.addToContent(sum)