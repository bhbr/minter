
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	ownDefaults(): object {
		return {
			radius: 7.0,
			fillOpacity: 1.0,
			fillColor: Color.white()
		}
	}

	ownMutabilities(): object {
		return {
			radius: 'never',
			fillOpacity: 'in_subclass'
		}
	}

	setup() {
		super.setup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() })
		}

	}

}