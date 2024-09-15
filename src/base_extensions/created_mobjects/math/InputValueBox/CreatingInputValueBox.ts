import { InputValueBox } from 'base_extensions/created_mobjects/math/InputValueBox/InputValueBox'
import { CreatingFixedMobject } from 'core/mobject/creating/CreatingFixedMobject'
import { Vertex } from 'core/helpers/Vertex'

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
