
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			radius: 7.0,
			fillOpacity: 1.0,
			fillColor: Color.white()
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			radius: 'never',
			fillOpacity: 'never'
		})
	}

	setup() {
		super.setup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() })
		}

	}

}