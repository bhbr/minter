
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Paper } from './core/Paper'
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { MathExpressionField } from './extensions/creations/MathExpressionField/MathExpressionField'
import { MathExpression } from './extensions/creations/MathExpressionField/MathExpression'
import { RadioButtonList } from './core/mobjects/RadioButtonList'
import { DesmosCalculator } from './extensions/creations/DesmosCalculator/DesmosCalculator'
import { ScatterPlot } from './extensions/creations/DesmosCalculator/ScatterPlot'
import { TextLabel } from './core/mobjects/TextLabel'
import { Color } from './core/classes/Color'
import { NumberListBox } from './extensions/creations/math/boxes/NumberListBox'
import { ScreenEventDevice } from './core/mobjects/screen_events'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()

window.setTimeout( function() {
	let button = paper.sidebar.buttons[1]
}, 1000)