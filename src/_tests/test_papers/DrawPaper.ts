
import { Paper } from '../../paper/Paper.js'
import { log } from '../../functions/logging.js'

export class DrawPaper extends Paper {


	loadContent() {
		let e1 = new MouseEvent('mousedown', {
			clientX: 300,
			clientY: 200
		})
		this.view.div.dispatchEvent(e1)

		for (let i = 1; i <= 10; i++) {
			let e2 = new MouseEvent('mousemove', {
				clientX: 300 + 20 * i,
				clientY: 200 + 10 * i ** 1.5 * (-1) ** i
			})
			this.view.div.dispatchEvent(e2)
		}
		let e3 = new PointerEvent('pointerup', {
			clientX: 500,
			clientY: 300
		})
		this.view.div.dispatchEvent(e3)
	}

}
