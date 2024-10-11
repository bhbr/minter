
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				radius: 7.0,
				fillOpacity: 1.0
			},
			mutable: {
				fillColor: Color.white()
			}
		})
	}

	setup() {
		super.setup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() })
		}

	}

}