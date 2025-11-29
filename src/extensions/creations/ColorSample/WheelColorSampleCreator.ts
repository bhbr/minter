
import { WheelColorSample } from './WheelColorSample'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex, vertexAdd, vertexTranslatedBy } from 'core/functions/vertex'

export class WheelColorSampleCreator extends DraggingCreator {
	
	declare creation: WheelColorSample

	defaults(): object {
		return {
			helpText: 'A wheel-shaped color picker (HSV model). The angle sets its hue, the saturation and value are fixed to 100 %.',
			pointOffset: [-30, -60]
		}
	}

	createMobject() {
		return new WheelColorSample({
			midpoint: vertexAdd(this.getStartPoint(), this.pointOffset)
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let r = this.creation.circle.radius
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
