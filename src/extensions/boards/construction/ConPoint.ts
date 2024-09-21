
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			radius: 7.0
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			fillColor: Color.white(),
			fillOpacity: 1.0
		})
	}

	statefulSetup() {
		super.statefulSetup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() }, false)
		}

	}

}