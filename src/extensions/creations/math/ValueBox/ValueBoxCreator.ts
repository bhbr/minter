
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

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.creation.hideLinks()
	}
}
