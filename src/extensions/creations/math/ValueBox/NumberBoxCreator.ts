
import { NumberBox } from './NumberBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class NumberBoxCreator extends DraggingCreator {
	
	declare creation: NumberBox

	createMobject() {
		return new NumberBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
