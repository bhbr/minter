
import { ColorSample } from 'extensions/creations/ColorSample/ColorSample'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex, vertexTranslatedBy } from 'core/functions/vertex'

export class ColorSampleCreator extends DraggingCreator {
	
	declare creation: ColorSample

	createMobject() {
		return new ColorSample({
			midpoint: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let r = this.creation.circle.radius
		super.updateFromTip(vertexTranslatedBy(q, [-r, -r]), redraw)
		this.creation.hideLinks()
	}
}
