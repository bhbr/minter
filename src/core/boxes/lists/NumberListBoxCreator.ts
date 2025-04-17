
import { NumberListBox } from './NumberListBox'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'

export class NumberListBoxCreator extends DraggingCreator {
	
	declare creation: NumberListBox

	createMobject() {
		return new NumberListBox({
			anchor: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
