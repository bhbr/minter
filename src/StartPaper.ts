
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { LinkableNumberBox } from './core/boxes_new/NumberBox'
import { NumberListBox, LinkableNumberListBox } from './core/boxes_new/NumberListBox'
import { BoxSlider } from './extensions/creations/math/BoxSlider/BoxSlider'
import { SumBox } from './core/boxes_new/SumBox'
import { AverageBox } from './core/boxes_new/AverageBox'
import { CumSumBox } from './core/boxes_new/CumSumBox'
import { CumAverageBox } from './core/boxes_new/CumAverageBox'

export class StartPaper extends CoinFlipPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new CoinFlipPaper()

let lnb = new LinkableNumberListBox({
	anchor: [100, 100],
	value: [1, 2, 3, 4]
})
paper.addToContent(lnb)

let nb = new LinkableNumberBox({
	anchor: [300, 100],
	value: 5
})
paper.addToContent(nb)

// let sb = new SumBox({
// 	anchor: [200, 100]
// })
// paper.addToContent(sb)

// let ab = new AverageBox({
// 	anchor: [400, 100]
// })
// paper.addToContent(ab)

// let csb = new CumSumBox({
// 	anchor: [600, 100]
// })
// paper.addToContent(csb)

// let cab = new CumAverageBox({
// 	anchor: [800, 100]
// })
// paper.addToContent(cab)


