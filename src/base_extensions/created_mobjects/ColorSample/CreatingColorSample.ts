import { ColorSample } from 'base_extensions/created_mobjects/ColorSample/ColorSample'
import { CreatingFixedMobject } from 'core/mobject/creating/CreatingFixedMobject'
import { Vertex } from 'core/helpers/Vertex'

export class CreatingColorSample extends CreatingFixedMobject {
	
	declare creation: ColorSample

	createdMobject() {
		return new ColorSample({
			midpoint: this.startPoint
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q.translatedBy(-this.creation.circle.radius, -this.creation.circle.radius))
		this.creation.hideLinks()
	}
}
