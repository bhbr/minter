
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { Coin } from './extensions/creations/CoinFlipper/Coin'
import { Transform } from './core/classes/Transform'
import { MathExpressionField } from './extensions/creations/MathExpressionField/MathExpressionField'
import { isTouchDevice, separateSidebar } from './core/mobjects/screen_events'
import { Rectangle } from './core/shapes/Rectangle'
import { Color } from './core/classes/Color'
import { NumberListBox } from './extensions/creations/math/boxes/NumberListBox'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()

let box = new NumberListBox({
	value: [0, 1, 0],
	anchor: [100, 100]
})
paper.addToContent(box)