
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConPoint extends Circle {

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'radius',
			'fillOpacity'
		])
	}


	defaults(): object {
		return Object.assign(super.defaults(), {
			radius: 7.0,
			fillColor: Color.white(),
			fillOpacity: 1.0
		})
	}

	setup() {
		super.setup()
		if (!this.midpoint || this.midpoint.isNaN()) {
			this.update({ midpoint: Vertex.origin() }, false)
		}

	}

}