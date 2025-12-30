
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { AllTests } from './_tests/allTests'
import { MathQuillExpressionField } from './extensions/creations/MathQuillExpressionField/MathQuillExpressionField'
import { RadioButtonList } from './core/mobjects/RadioButtonList'

export class StartPaper extends CoinFlipPaper { }

AllTests.run()

export const paper = new StartPaper()

