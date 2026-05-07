
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { Partition } from './extensions/animation_sequences/PascalsBrickWall/Partition'
import { TextLabel } from './core/ui/TextLabel'
import { isTouchDevice } from './core/mobjects/screen_events'
import { ImageView } from './core/mobjects/ImageView'
import { Mobject } from './core/mobjects/Mobject'
import { binomial } from './core/functions/math'
import { Rectangle } from './core/shapes/Rectangle'
import { deepCopy } from './core/functions/copying'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let p = new Partition({
	nbFlips: 1,
	anchor: [200, 300],
	presentationForm: 'row'
})
paper.addToContent(p)


