
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { NumberListBox, LinkableNumberListBox } from './core/boxes_new/NumberListBox'
import { BoxSlider } from './extensions/creations/math/BoxSlider/BoxSlider'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let nb = new NumberListBox({
	anchor: [100, 100],
	value: [1, 2, 3]
})

paper.addToContent(nb)

nb.update({
	anchor: [100, 300]
})

let lnb = new LinkableNumberListBox({
	anchor: [300, 100],
	value: [4, 5, 6]
})
paper.addToContent(lnb)





