
import { WheelColorSample } from './WheelColorSample'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex, vertexTranslatedBy } from 'core/functions/vertex'

export class WheelColorSampleCreator extends DraggingCreator {
	
	declare creation: WheelColorSample

	createMobject() {
		return new WheelColorSample({
			midpoint: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let r = this.creation.circle.radius
		super.updateFromTip(vertexTranslatedBy(q, [-r, -r]), redraw)
		this.creation.hideLinks()
	}
}
