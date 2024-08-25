import { Circle } from '../shapes/Circle'
import { Vertex } from '../helpers/Vertex'
import { Color } from '../helpers/Color'
import { log } from '../helpers/helpers'

export class ConstructionPoint extends Circle {

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