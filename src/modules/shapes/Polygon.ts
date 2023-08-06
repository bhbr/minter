import { VMobject } from '../mobject/VMobject'
import { stringFromPoint } from '../helpers/helpers'

export class Polygon extends VMobject {

	closed: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			closed: true
		})
	}

	pathString(): string {
		let pathString: string = ''
		let v = this.vertices
		if (v.length == 0) { return '' }
		for (let point of v) {
			if (point == undefined || point.isNaN()) {
				pathString = ''
				return pathString
			}
			let prefix: string = (pathString == '') ? 'M' : 'L'
			pathString += prefix + stringFromPoint(point)
		}
		if (this.closed) {
			pathString += 'Z'
		}
		return pathString
	}
	
}