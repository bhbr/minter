
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { Board } from './Board'
import { vertex } from 'core/functions/vertex'


export class BoardCreator extends SpanningCreator {

	declare creation?: Board

	createMobject(): Board {
		let topLeft = this.topLeftVertex()
		let cm = new Board({
			compactAnchor: topLeft,
			compactWidth: this.getWidth(),
			compactHeight: this.getHeight()
		})
		cm.contractStateChange()
		cm.expandButton.show()
		return cm
	}

	dissolve() {
		let w = this.getWidth()
		let h = this.getHeight()
		if (w < 25 || h < 25) { return }
		super.dissolve()
	}

}