import { ColorSample } from '../color/ColorSample'
import { CreatingFixedMobject } from './CreatingFixedMobject'
import { Vertex } from '../helpers/Vertex'

export class CreatingColorSample extends CreatingFixedMobject {
	
	declare creation: ColorSample

	createdMobject() {
		return new ColorSample({
			midpoint: this.startPoint
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q.translatedBy(-this.creation.radius, -this.creation.radius))
		this.creation.hideLinks()
	}
}
