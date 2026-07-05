
import { log } from './core/functions/logging'
import { AllTests } from './_tests/allTests'
import { Paper } from './core/Paper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { AlgebraLexerTest } from './_tests/unit_tests/extensions/AlgebraLexerTest'
import { AlgebraParserTest } from './_tests/unit_tests/extensions/AlgebraParserTest'
import { VisualFormulaMaker } from './extensions/creations/VisualAlgebra/view/VisualFormulaMaker'
import { VisualSymbol} from './extensions/creations/VisualAlgebra/view/VisualSymbol'
import { VisualVariable} from './extensions/creations/VisualAlgebra/view/VisualVariable'
import { VisualCalculation } from './extensions/creations/VisualAlgebra/view/VisualCalculation'
import { MathQuillLoader } from './extensions/apis/MathQuillLoader'
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Popover } from './core/ui/Popover'
import { Rectangle } from './core/shapes/Rectangle'
import { Color } from './core/classes/Color'
import { Algebra } from './extensions/creations/VisualAlgebra/model/Algebra'
import { SentenceTree } from './extensions/creations/VisualAlgebra/model/SentenceTypes'
import { MGroup } from './core/mobjects/MGroup'
import { ArrayTest } from './_tests/unit_tests/core/functions/ArrayTest'
import { TestTest } from './_tests/TestTests'

export class StartPaper extends DemoPaper {

	defaults(): object {
		return {
			apiLoaders: [
				new MathQuillLoader()
			]
		}
	}

	loadContent() {
		let calc = new VisualCalculation({
			anchor: [100, 100]
		})
		this.addToContent(calc)
	}

}

//TestTest.run()
AlgebraLexerTest.run()
AlgebraParserTest.run()
//ArrayTest.run()

export const paper = new StartPaper()

