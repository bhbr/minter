
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/AllTests'
import { NumberListBox } from './core/boxes/lists/NumberListBox'
import { ListBox } from './core/boxes/lists/ListBox'
import { Board } from './core/boards/Board'
import { Mobject } from './core/mobjects/Mobject'
import { Linkable } from './core/linkables/Linkable'
import { LinkOutlet } from './core/linkables/LinkOutlet'

export class StartPaper extends CoinFlipPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let board = new Board({
	compactAnchor: [200, 200],
	inputNames: ['a']
})
paper.addToContent(board)