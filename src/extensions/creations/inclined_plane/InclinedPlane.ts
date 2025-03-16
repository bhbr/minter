
import { Polygon } from 'core/vmobjects/Polygon'
import { vertex, vertexCopyFrom, vertexTranslatedBy } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'

export class InclinedPlane extends Polygon {
	
	length: number
	inclination: number
	midpoint: vertex

	defaults(): object {
		return {
			length: undefined,
			midpoint: [0, 0],
			inclination: 0,
			fillColor: Color.white(),
			fillOpacity: 0.5,
			vertices: [
				[0, 0],
				[0, 0],
				[0, 0]
			]
		}
	}

	mutabilities(): object {
		return {
			length: 'on_init'
		}
	}

	getWidth(): number {
		return this.length * Math.cos(this.inclination)
	}

	getHeight(): number {
		return this.length * Math.sin(this.inclination)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let w = this.getWidth()
		let h = this.getHeight()
		vertexCopyFrom(this.vertices[0], vertexTranslatedBy(this.midpoint, [-w/2, h/2]))
		vertexCopyFrom(this.vertices[1], vertexTranslatedBy(this.midpoint, [w/2, h/2]))
		vertexCopyFrom(this.vertices[2], vertexTranslatedBy(this.midpoint, [w/2, -h/2]))
		if (redraw) { this.view.redraw() }
	}

}