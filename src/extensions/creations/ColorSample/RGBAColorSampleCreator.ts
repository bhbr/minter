
import { RGBAColorSample } from './RGBAColorSample'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex, vertexAdd, vertexTranslatedBy } from 'core/functions/vertex'

export class RGBAColorSampleCreator extends DraggingCreator {
	
	declare creation: RGBAColorSample

	defaults(): object {
		return {
			helpText: 'A color defined by its red, green, blue and alpha (RGBA) components as input variables.',
			pointOffset: [-30, -60]
		}
	}

	createMobject() {
		return new RGBAColorSample({
			midpoint: vertexAdd(this.getStartPoint(), this.pointOffset)
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let r = this.creation.circle.radius
		super.updateFromTip(q, redraw)
		this.creation.hideLinks()
	}
}
