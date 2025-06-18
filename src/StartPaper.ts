
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { Partition } from './extensions/animation_sequences/PascalsBrickWall/Partition'
import { TextLabel } from './core/mobjects/TextLabel'
import { isTouchDevice } from './core/mobjects/screen_events'
import { ImageView } from './core/mobjects/ImageView'
import { Mobject } from './core/mobjects/Mobject'
import { Coin } from './extensions/creations/CoinFlipper/Coin'
import { PlayableCoin } from './extensions/creations/CoinFlipper/PlayableCoin'
import { CoinRow } from './extensions/creations/CoinFlipper/CoinRow'
import { LinkableNumberListBox } from './core/boxes/NumberListBox'
import { SequencePlot } from './extensions/creations/DesmosCalculator/SequencePlot'
import { AddBox } from './core/boxes/BinaryOperatorBox'


export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let p = new Partition({
	nbFlips: 4,
	anchor: [200, 400],
	presentationForm: 'centered-histogram'
})
paper.addToContent(p)




