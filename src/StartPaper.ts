
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { Brick } from './extensions/animation_sequences/PascalsBrickWall/Brick'
import { Partition } from './extensions/animation_sequences/PascalsBrickWall/Partition'
import { PascalsBrickWall } from './extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall'
import { BASE_BRICK_HEIGHT } from './extensions/animation_sequences/PascalsBrickWall/constants'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

//if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let wall = new PascalsBrickWall({
	anchor: [100, 500]
})
paper.addToContent(wall)