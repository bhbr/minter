
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { MathExpressionField } from './extensions/creations/MathExpressionField/MathExpressionField'
import { MathExpression } from './extensions/creations/MathExpressionField/MathExpression'
import { RadioButtonList } from './core/mobjects/RadioButtonList'
import { DesmosCalculator } from './extensions/creations/DesmosCalculator/DesmosCalculator'
import { ScatterPlot } from './extensions/creations/DesmosCalculator/ScatterPlot'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()


let exp = new MathExpressionField({
	anchor: [100, 100]
})

paper.addToContent(exp)

