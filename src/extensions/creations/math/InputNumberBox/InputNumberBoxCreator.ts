
import { InputNumberBox } from 'extensions/creations/math/InputNumberBox/InputNumberBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class InputNumberBoxCreator extends DraggingCreator {
	
	declare creation: InputNumberBox

	createMobject() {
		return new InputNumberBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
