
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { NumberBox, LinkableNumberBox } from './core/boxes_new/NumberBox'
import { BoxSlider } from './extensions/creations/math/BoxSlider/BoxSlider'

export class StartPaper extends DemoPaper { }

let TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let nb = new NumberBox({
	anchor: [100, 100],
	value: 2
})

paper.addToContent(nb)

nb.update({
	anchor: [100, 300]
})

let lnb = new LinkableNumberBox({
	value: 3,
	anchor: [300, 100]
})
paper.addToContent(lnb)

let slider = new BoxSlider({
	anchor: [500, 100]
})
paper.addToContent(slider)


