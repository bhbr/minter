import { ValueBox } from '../arithmetic/ValueBox'
import { CreatingFixedMobject } from './CreatingFixedMobject'
import { Vertex } from '../helpers/Vertex'

export class CreatingValueBox extends CreatingFixedMobject {
	
	declare creation: ValueBox

	createdMobject() {
		return new ValueBox({
			anchor: this.startPoint
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.creation.hideLinks()
	}
}
