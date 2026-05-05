
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { Coin } from './extensions/creations/CoinFlipper/Coin'
import { Transform } from './core/classes/Transform'
import { AlgebraVisualizer } from './extensions/creations/VisualAlgebra/Algebra'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { Rectangle } from './core/shapes/Rectangle'
import { Color } from './core/classes/Color'
import { NumberListBox } from './extensions/creations/math/boxes/NumberListBox'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()


let av = new AlgebraVisualizer({
	anchor: [100, 100]
})
paper.addToContent(av)

window.setTimeout(function() {

	av.loadTexFormula('a \\cdot b + a \\cdot \\sqrt{\\pi}')

}, 2500)