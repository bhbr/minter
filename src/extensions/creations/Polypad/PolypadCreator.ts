
import { Mobject } from 'mobjects/Mobject.js'
import { Board } from 'boards/Board.js'
import { PolypadMobject } from './PolypadMobject.js'
import { SpanningCreator } from 'creators/SpanningCreator.js'

export class PolypadCreator extends SpanningCreator {

	declare creation?: PolypadMobject

	createMobject(): PolypadMobject {
		let p = this.getStartPoint()
		return new PolypadMobject({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}

}