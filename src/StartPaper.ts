
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
import { MathQuillLoader } from './extensions/apis/MathQuillLoader'
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { Popover } from './core/ui/Popover'
import { Rectangle } from './core/shapes/Rectangle'
import { Color } from './core/classes/Color'
import { Algebra } from './extensions/creations/VisualAlgebra/model/Algebra'
import { SentenceTree } from './extensions/creations/VisualAlgebra/model/SentenceTypes'

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

//AllTests.run()

export const paper = new StartPaper()

let a = new Algebra()
let tex = 'a * b + 2 * b'
log(tex)
let sentence = a.lexer.stringToSentence(tex)
log(sentence)
let tree = a.parser.sentenceToTree(sentence)
log(tree)
let rules = a.applicableRules(tree)
log(rules)
let tree2 = a.applyRuleToTree('right_factor_addition_bracket', tree)
log(tree2)
let sentence2 = a.parser.treeToSentence(tree2)
log(sentence2)

