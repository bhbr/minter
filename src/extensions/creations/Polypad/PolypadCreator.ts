
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { PolypadMobject } from './PolypadMobject'
import { SpanningCreator } from 'core/creators/SpanningCreator'

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