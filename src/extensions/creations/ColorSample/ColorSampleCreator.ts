
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

	updateFromTip(q: Vertex, redraw: boolean = true) {
		let r = this.creation.circle.radius
		super.updateFromTip(q.translatedBy(-r, -r), redraw)
		this.creation.hideLinks()
	}
}
