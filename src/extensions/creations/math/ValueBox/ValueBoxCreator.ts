
import { ValueBox } from './ValueBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class ValueBoxCreator extends DraggingCreator {
	
	declare creation: ValueBox

	createMobject() {
		return new ValueBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
