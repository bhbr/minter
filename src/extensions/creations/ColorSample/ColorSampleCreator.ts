
import { ColorSample } from 'extensions/creations/ColorSample/ColorSample'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { Vertex } from 'core/classes/vertex/Vertex'

export class ColorSampleCreator extends DraggingCreator {
	
	declare creation: ColorSample

	createMobject() {
		return new ColorSample({
			midpoint: this.getStartPoint()
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q.translatedBy(-this.creation.circle.radius, -this.creation.circle.radius))
		this.creation.hideLinks()
	}
}
