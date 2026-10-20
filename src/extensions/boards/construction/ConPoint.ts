
import { Circle } from 'shapes/Circle.js'
import { vertex, vertexIsNaN, vertexOrigin } from '@bhbr/affr2'
import { Color } from 'classes/Color.js'

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