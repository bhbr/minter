
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { Brick } from './extensions/animation_sequences/PascalsBrickWall/Brick'
import { Partition } from './extensions/animation_sequences/PascalsBrickWall/Partition'
import { PascalsBrickWall } from './extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

//if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let p = new Partition({
	anchor: [100, 300],
	nbFlips: 1
})

paper.addToContent(p)