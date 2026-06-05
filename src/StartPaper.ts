
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { Color } from './core/classes/Color'
import { NumberListBox } from './extensions/creations/math/boxes/NumberListBox'
import { NumberBox } from './extensions/creations/math/boxes/NumberBox'


export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()


if (isTouchDevice && separateSidebar) {
	paper.background.view.div.style.backgroundColor = 'rgba(0, 0, 0, 1)'
}

