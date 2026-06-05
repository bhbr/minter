
import { Circle } from 'core/shapes/Circle'
import { vertex, vertexOrigin, vertexSubtract, vertexNorm } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'

export class ConCircle extends Circle {
/*
For constructions. A circle defined by its midpoint and a point
on its circumference. The radius (and anchor) is updated automatically.
*/

	outerPoint: vertex

	defaults(): object {
		return {
			strokeColor: Color.white(),
			fillColor: Color.white(),
			fillOpacity: 0,
			outerPoint: vertexOrigin()
		}
	}

	setup() {
		super.setup()
		this.view.div.style['pointer-events'] = 'none'
	}

	update(args: object = {}, redraw: boolean = true) {
		let p = args['midpoint'] || this.midpoint
		let q = args['outerPoint'] || this.outerPoint
		let r = vertexNorm(vertexSubtract(p, q))
		args['radius'] = r
		super.update(args, redraw)
	}

}