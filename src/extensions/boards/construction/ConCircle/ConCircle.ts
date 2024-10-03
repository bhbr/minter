
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ConCircle extends Circle {
/*
For constructions. A circle defined by its midpoint and a point
on its circumference. The radius (and anchor) is updated automatically.
*/

	outerPoint: Vertex

	defaults() {
		return Object.assign(super.defaults(), {
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

	update(argsDict: object = {}, redraw: boolean = true) {
		let p = argsDict['midpoint'] || this.midpoint
		let q = argsDict['outerPoint'] || this.outerPoint
		let r = p.subtract(q).norm()
		argsDict['radius'] = r
		super.update(argsDict, redraw)
	}

}