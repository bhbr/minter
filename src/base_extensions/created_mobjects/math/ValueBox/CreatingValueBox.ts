import { ValueBox } from './ValueBox'
import { CreatingFixedMobject } from 'core/mobject/creating/CreatingFixedMobject'
import { Vertex } from 'core/helpers/Vertex'

export class CreatingValueBox extends CreatingFixedMobject {
	
	declare creation: ValueBox

	createMobject() {
		return new ValueBox({
			anchor: this.startPoint
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.creation.hideLinks()
	}
}
