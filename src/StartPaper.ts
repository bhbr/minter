
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { NumberListBox } from './core/boxes/lists/NumberListBox'
import { ListBox } from './core/boxes/lists/ListBox'
import { TestAnimationSequence } from './extensions/animation_sequences/TestAnimationSequence'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let ta = new TestAnimationSequence({
	anchor: [0, 0],
	frameWidth: paper.frameWidth,
	frameHeight: paper.frameHeight
})
paper.add(ta)
