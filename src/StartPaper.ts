
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { Brick } from './extensions/animation_sequences/PascalsBrickWall/Brick'
import { Partition } from './extensions/animation_sequences/PascalsBrickWall/Partition'
import { PascalsBrickWall } from './extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall'
import { DetailedBrickLabel } from './extensions/animation_sequences/PascalsBrickWall/DetailedBrickLabel'
import { BASE_BRICK_HEIGHT } from './extensions/animation_sequences/PascalsBrickWall/constants'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

//if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

// let wall = new PascalsBrickWall({
// 	anchor: [100, 500]
// })

// paper.addToContent(wall)

let p = new Partition({
	anchor: [100, 300],
	nbFlips: 1
})

paper.addToContent(p)

// let b = new Brick({
// 	anchor: [100, 100],
// 	nbFlips: 1,
// 	nbTails: 0,
// 	height: BASE_BRICK_HEIGHT
// })

// paper.add(b)

// let l = new DetailedBrickLabel({
// 	anchor: [100, 100],
// 	nbHeads: 0,
// 	nbTails: 0
// })

// paper.add(l)

// l.update({
// 	nbHeads: 1
// })

// l.addTailsCoins(2)
// l.removeHeadsCoin()


