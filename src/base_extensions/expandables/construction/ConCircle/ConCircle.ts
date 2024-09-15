import { Circle } from 'base_extensions/mobjects/shapes/Circle'
import { Vertex } from 'core/helpers/Vertex'
import { Color } from 'core/helpers/Color'

export class ConCircle extends Circle {
/*
For constructions. A circle defined by its midpoint and a point
on its circumference. The radius (and anchor) is updated automatically.
*/

	outerPoint: Vertex

	defaultArgs() {
		return Object.assign(super.defaultArgs(), {
			strokeColor: Color.white(),
			fillColor: Color.white(),
			fillOpacity: 0,
			outerPoint: Vertex.origin()
		})
	}


	statefulSetup() {
		super.statefulSetup()
		this.view.style['pointer-events'] = 'none'
	}

	updateModel(argsDict: object = {}) {

		let p = argsDict['midpoint'] || this.midpoint
		let q = argsDict['outerPoint'] || this.outerPoint
		let r = p.subtract(q).norm()
		argsDict['radius'] = r
		super.updateModel(argsDict)
	}

}