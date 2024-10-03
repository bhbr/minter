
import { ValueBox } from './ValueBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { Vertex } from 'core/classes/vertex/Vertex'

export class ValueBoxCreator extends DraggingCreator {
	
	declare creation: ValueBox

	createMobject() {
		return new ValueBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: Vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
