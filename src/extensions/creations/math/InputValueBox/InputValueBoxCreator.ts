
import { InputValueBox } from 'extensions/creations/math/InputValueBox/InputValueBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { Vertex } from 'core/classes/vertex/Vertex'

export class InputValueBoxCreator extends DraggingCreator {
	
	declare creation: InputValueBox

	createMobject() {
		return new InputValueBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: Vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
