
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { TeXParserTest } from './_tests/unit_tests/extensions/TeXParserTest'
import { VisualSymbol, VisualVariable, VisualFormula } from './extensions/creations/VisualAlgebra/view/VisualFormula'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()

TeXParserTest.run()

let s = new VisualSymbol({
	texString: '\\sin',
	anchor: [100, 100]
})

paper.add(s)

s.update({
	texString: '\\cos'
})


window.setTimeout(function() {
	let v = new VisualVariable({
		name: 'a',
		anchor: [300, 100]
	})

	paper.add(v)

	v.update({
		name: 'y'
	})
	
	let f = VisualFormula.texToVisual('a + b')

	f.update({
		anchor: [500, 100]
	})

	paper.add(f)
}, 2000)


