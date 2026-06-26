
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { TeXParserTest } from './_tests/unit_tests/extensions/TeXParserTest'
import { VisualFormulaMaker } from './extensions/creations/VisualAlgebra/view/VisualFormulaMaker'
import { VisualCalculation } from './extensions/creations/VisualAlgebra/view/VisualCalculation'
import { TeXParser } from './extensions/creations/VisualAlgebra/model/TeXParser'
import { MathExpressionField } from './extensions/creations/_MathExpressionField/MathExpressionField'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()

TeXParserTest.run()

let calc = new VisualCalculation({
	anchor: [100, 100]
})

paper.addToContent(calc)