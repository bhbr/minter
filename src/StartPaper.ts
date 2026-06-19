
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { MinterParserTest } from './_tests/unit_tests/extensions/MinterParserTest'
import { MathExpressionField } from './extensions/creations/MathExpressionField/MathExpressionField'
import { parseTeX } from './extensions/creations/MathExpressionField/MinterParser'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()

MinterParserTest.run()
