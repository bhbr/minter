
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { NumberListBox, LinkableNumberListBox } from './core/boxes_new/NumberListBox'
import { BoxSlider } from './extensions/creations/math/BoxSlider/BoxSlider'
import { SumBox } from './core/boxes_new/SumBox'
import { AverageBox } from './core/boxes_new/AverageBox'
import { CumSumBox } from './core/boxes_new/CumSumBox'
import { CumAverageBox } from './core/boxes_new/CumAverageBox'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let lnb = new LinkableNumberListBox({
	anchor: [100, 100],
	value: [4, 5, 6]
})
paper.addToContent(lnb)

let sb = new SumBox({
	anchor: [200, 100]
})
paper.addToContent(sb)

let ab = new AverageBox({
	anchor: [400, 100]
})
paper.addToContent(ab)

let csb = new CumSumBox({
	anchor: [600, 100]
})
paper.addToContent(csb)

let cab = new CumAverageBox({
	anchor: [800, 100]
})
paper.addToContent(cab)


