
import { Circle } from 'core/shapes/Circle'
import { vertex, vertexIsNaN, vertexOrigin } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	defaults(): object {
		return {
			radius: 7.0,
			fillOpacity: 1.0,
			fillColor: Color.white()
		}
	}

	mutabilities(): object {
		return {
			radius: 'never',
			fillOpacity: 'in_subclass'
		}
	}

	setup() {
		super.setup()
		if (!this.midpoint || vertexIsNaN(this.midpoint)) {
			this.update({ midpoint: vertexOrigin() })
		}

	}

}