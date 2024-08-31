import { InputValueBox } from '../arithmetic/InputValueBox'
import { CreatingFixedMobject } from './CreatingFixedMobject'
import { Vertex } from '../helpers/Vertex'

export class CreatingInputValueBox extends CreatingFixedMobject {
	
	declare creation: InputValueBox

	createdMobject() {
		return new InputValueBox({
			anchor: this.startPoint
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.creation.hideLinks()
	}
}
