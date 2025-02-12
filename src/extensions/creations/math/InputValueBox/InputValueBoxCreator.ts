
import { InputValueBox } from 'extensions/creations/math/InputValueBox/InputValueBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class InputValueBoxCreator extends DraggingCreator {
	
	declare creation: InputValueBox

	createMobject() {
		return new InputValueBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
