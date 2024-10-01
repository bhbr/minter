
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	defaults(): object {
		return {
			radius: 7.0,
			fillColor: Color.white(),
			fillOpacity: 1.0
		}
	}

	setup() {
		super.setup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() }, false)
		}

	}

}