import { VMobject } from '../mobject/VMobject'
import { stringFromPoint } from '../helpers/helpers'
import { Vertex } from '../helpers/Vertex_Transform'

export class Polygon extends VMobject {

	closed: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			closed: true
		})
	}

	geeomtricProperties(): Array<string> {
		return super.animatableProperties().concat([
			'vertices'
		])
	}

	static makePathString(vertices: Array<Vertex>, closed: boolean): string {
		let pathString: string = ''
		let v = vertices
		if (v.length == 0) { return '' }
		for (let point of v) {
			if (point == undefined || point.isNaN()) {
				pathString = ''
				return pathString
			}
			let prefix: string = (pathString == '') ? 'M' : 'L'
			pathString += prefix + stringFromPoint(point)
		}
		if (closed) {
			pathString += 'Z'
		}
		return pathString
	}

	pathString(): string {
		return Polygon.makePathString(this.vertices, this.closed)
	}
	
}