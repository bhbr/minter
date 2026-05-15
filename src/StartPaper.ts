
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { Partition } from './extensions/animation_sequences/PascalsBrickWall/Partition'
import { PascalsBrickWall } from './extensions/animation_sequences/PascalsBrickWall/PascalsBrickWall'
import { TextLabel } from './core/ui/TextLabel'
import { isTouchDevice } from './core/mobjects/screen_events'
import { ImageView } from './core/mobjects/ImageView'
import { Mobject } from './core/mobjects/Mobject'
import { binomial } from './core/functions/math'
import { Rectangle } from './core/shapes/Rectangle'
import { deepCopy } from './core/functions/copying'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

//if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let p = new Partition({
	nbFlips: 3,
	anchor: [0, 500],
	presentationForm: 'row'
})
paper.addToContent(p)


// let wall = new PascalsBrickWall({
// 	anchor: [200, 600]
// })
// paper.addToContent(wall)