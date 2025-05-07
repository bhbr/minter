
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { TextLabel } from './core/mobjects/TextLabel'
import { isTouchDevice } from './core/mobjects/screen_events'
import { ImageView } from './core/mobjects/ImageView'
import { Mobject } from './core/mobjects/Mobject'
import { Coin } from './extensions/creations/CoinFlipper/Coin'
import { LinkableNumberListBox } from './core/boxes/NumberListBox'
import { SequencePlot } from './extensions/creations/DesmosCalculator/SequencePlot'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let plot = new SequencePlot({
	anchor: [100, 100],
	frameWidth: 500,
	frameHeight: 300,
	data: [1, 4, 3, 2, 6, 5, 3, 2, 1]
})
paper.add(plot)

