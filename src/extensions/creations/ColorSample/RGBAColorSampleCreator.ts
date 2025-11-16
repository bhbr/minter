
import { RGBAColorSample } from './RGBAColorSample'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex, vertexTranslatedBy } from 'core/functions/vertex'

export class RGBAColorSampleCreator extends DraggingCreator {
	
	declare creation: RGBAColorSample

	defaults(): object {
		return {
			helpText: 'A color defined by its red, green and blue components as input variables.'
		}
	}

	createMobject() {
		return new RGBAColorSample({
			midpoint: this.getStartPoint()
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		let r = this.creation.circle.radius
		super.updateFromTip(vertexTranslatedBy(q, [-r, -r]), redraw)
		this.creation.hideLinks()
	}
}
