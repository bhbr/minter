
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { Board } from './Board'
import { log } from 'core/functions/logging'

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
		cm.expandButton.view.show()
		return cm
	}

	dissolve() {
		log('BoardCreator.dissolve')
		let w = this.getWidth()
		let h = this.getHeight()
		if (w < 25 || h < 25) { return }

		if (this.creation) {
			this.remove(this.creation)
		}
		this.creation = this.createMobject()
		this.parent.addToContent(this.creation)
		this.creation.disable()
		this.parent.creator = null
		this.parent.remove(this)
	}

}