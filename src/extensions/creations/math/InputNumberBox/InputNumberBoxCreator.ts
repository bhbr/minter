
import { LinkableInputNumberBox } from 'extensions/creations/math/InputNumberBox/LinkableInputNumberBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class InputNumberBoxCreator extends DraggingCreator {
	
	declare creation: LinkableInputNumberBox

	createMobject() {
		return new LinkableInputNumberBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
