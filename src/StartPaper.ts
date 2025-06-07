
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { AllTests } from './_tests/allTests'
import { TextLabel } from './core/mobjects/TextLabel'
import { isTouchDevice } from './core/mobjects/screen_events'
import { ImageView } from './core/mobjects/ImageView'
import { Mobject } from './core/mobjects/Mobject'
import { Coin } from './extensions/creations/CoinFlipper/Coin'
import { PlayableCoin } from './extensions/creations/CoinFlipper/PlayableCoin'
import { CoinRow } from './extensions/creations/CoinFlipper/CoinRow'
import { LinkableNumberListBox } from './core/boxes/NumberListBox'
import { SequencePlot } from './extensions/creations/DesmosCalculator/SequencePlot'
import { AddBox } from './core/boxes/BinaryOperatorBox'

export class StartPaper extends CoinFlipPaper { }

export const TESTING = true

if (TESTING) { AllTests.run() }

export const paper = new StartPaper()

let coin = new PlayableCoin({
	anchor: [200, 200]
})
let box = new AddBox({
	anchor: [500, 200]
})
paper.addToContent(coin)
paper.addToContent(box)

// let startPos = [100, 100]
// let endPos = [300, 200]
// let duration = 1000 // ms
// let dt = 50
// let nbPos = Math.round(duration / dt)
// let dx = (endPos[0] - startPos[0]) / nbPos
// let dy = (endPos[1] - startPos[1]) / nbPos
// let positions = []
// for (var i = 0; i < nbPos; i++) {
// 	let pos = [endPos[0] - i * dx, endPos[1] - i * dy]
// 	positions.push(pos)
// }

// let downEvent = new MouseEvent('mousedown', {
// 	clientX: startPos[0],
// 	clientY: startPos[1]
// })
// paper.view.div.dispatchEvent(downEvent)

// var handle = 0

// function liftMouse() {
// 	let upEvent =  new PointerEvent('pointerup', {
// 		clientX: endPos[0],
// 		clientY: endPos[1]
// 	})
// 	paper.view.div.dispatchEvent(upEvent)
// }

// function moveMouse() {
// 	let pos = positions.pop()
// 	if (!pos) {
// 		window.clearInterval(handle)
// 		liftMouse()
// 		return
// 	}
// 	let moveEvent =  new MouseEvent('mousemove', {
// 		clientX: pos[0],
// 		clientY: pos[1]
// 	})
// 	paper.view.div.dispatchEvent(moveEvent)
// }

// handle = window.setInterval(moveMouse, dt)


