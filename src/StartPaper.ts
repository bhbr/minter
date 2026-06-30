
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { Paper } from './core/Paper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { TeXParserTest } from './_tests/unit_tests/extensions/TeXParserTest'
import { VisualFormulaMaker } from './extensions/creations/VisualAlgebra/view/VisualFormulaMaker'
import { VisualSymbol} from './extensions/creations/VisualAlgebra/view/VisualSymbol'
import { VisualVariable} from './extensions/creations/VisualAlgebra/view/VisualVariable'
import { VisualCalculation } from './extensions/creations/VisualAlgebra/view/VisualCalculation'
import { TeXParser } from './extensions/creations/VisualAlgebra/model/TeXParser'
import { MathExpressionField } from './extensions/creations/_MathExpressionField/MathExpressionField'
import { MathQuillLoader } from './extensions/apis/MathQuillLoader'
import { conditionTrigger } from './core/functions/various'

export class StartPaper extends CoinFlipPaper {

	defaults(): object {
		return {
			apiLoaders: [
				new MathQuillLoader()
			]
		}
	}

	loadContent() {
	// 	TeXParserTest.run()

	// 	let calc = new VisualCalculation({
	// 		anchor: [100, 100]
	// 	})
	// 	paper.addToContent(calc)

	// 	let a = new VisualVariable({ name: 'a' })
	// 	a.update({
	// 		anchor: [500, 100]
	// 	})
	// 	paper.add(a)

	// 	let f = new VisualSymbol({ texString: 's'})
	// 	f.update({
	// 		anchor: [300, 300]
	// 	})
	// 	paper.add(f)


	}

}

//AllTests.run()

export const paper = new StartPaper()
