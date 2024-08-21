import { Circle } from './Circle'
import { Vertex } from '../helpers/Vertex'
import { Color } from '../helpers/Color'

export class TwoPointCircle extends Circle {

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