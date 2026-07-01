
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
import { Wavy } from './extensions/creations/Wavy/Wavy'
import { CindyLoader } from './extensions/apis/CindyLoader'
import { DemoPaper } from './extensions/boards/demo/DemoPaper'


export class StartPaper extends DemoPaper {

	defaults(): object {
		return {
			apiLoaders: [
				new CindyLoader()
			]
		}
	}

	loadContent() {

		let w = new Wavy({
			anchor: [100, 100],
			frameWidth: 200,
			frameHeight: 200,
			nbSources: 2
		})

		this.addToContent(w)

		w.play()

	}

}

//AllTests.run()

export const paper = new StartPaper()
