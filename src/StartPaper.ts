
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
import { PlayableCoin } from './extensions/creations/CoinFlipper/PlayableCoin'
import { CoinRow } from './extensions/creations/CoinFlipper/CoinRow'
import { LinkableNumberListBox } from './core/boxes/NumberListBox'
import { VariableSheet } from './extensions/creations/DesmosCalculator/VariableSheet'
import { TestDesmosCalculator } from './extensions/creations/DesmosCalculator/TestDesmosCalculator'
import { SequencePlot } from './extensions/creations/DesmosCalculator/SequencePlot'
import { AddBox } from './core/boxes/BinaryOperatorBox'
import { BoxSlider } from './extensions/creations/math/BoxSlider/BoxSlider'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let calc = new VariableSheet({
	anchor: [100, 100],
	frameWidth: 500,
	frameHeight: 400
})
paper.addToContent(calc)

let slider = new BoxSlider({
	anchor: [700, 100],
	height: 200,
	frameHeight: 200
})
paper.addToContent(slider)



