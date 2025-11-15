
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
import { NumberListBox } from './extensions/creations/math/boxes/NumberListBox'
import { TestDesmosCalculator } from './extensions/creations/DesmosCalculator/TestDesmosCalculator'
import { SequencePlot } from './extensions/creations/DesmosCalculator/SequencePlot'
import { AddBox } from './extensions/creations/math/box_functions/BinaryOperatorBox'
import { BoxSlider } from './extensions/creations/math/BoxSlider/BoxSlider'
import { removeAll } from './core/functions/arrays'
import { DesmosExpression } from './extensions/creations/DesmosCalculator/DesmosExpression'
import { DesmosExpressionSheet } from './extensions/creations/DesmosCalculator/DesmosExpressionSheet'
import { Rectangle } from './core/shapes/Rectangle'
import { ScreenEventHandler } from './core/mobjects/screen_events'
import { MathQuillFormula } from './extensions/creations/MathQuillFormula/MathQuillFormula'
import {roundedString } from './core/functions/various'
import { CoinSet } from './extensions/creations/CoinFlipper/CoinSet'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()


