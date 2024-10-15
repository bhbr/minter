
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConCircle extends Circle {
/*
For constructions. A circle defined by its midpoint and a point
on its circumference. The radius (and anchor) is updated automatically.
*/

	outerPoint: Vertex

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			strokeColor: Color.white(),
			fillColor: Color.white(),
			fillOpacity: 0,
			outerPoint: Vertex.origin()
		})
	}

	setup() {
		super.setup()
		this.view.style['pointer-events'] = 'none'
	}

	update(args: object = {}, redraw: boolean = true) {
		let p = args['midpoint'] || this.midpoint
		let q = args['outerPoint'] || this.outerPoint
		let r = p.subtract(q).norm()
		args['radius'] = r
		super.update(args, redraw)
	}

}