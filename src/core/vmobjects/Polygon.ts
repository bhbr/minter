
import { VMobject } from './VMobject'
import { VertexArray } from 'core/classes/vertex/VertexArray'

export class Polygon extends VMobject {
	/*
	In a polygon, the array this.points describes the vertices connected by straight lines.
	*/

	closed: boolean

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				closed: true
			}
		})
	}

	static makePathString(vertices: VertexArray, closed: boolean): string {
		let pathString: string = ''
		let v = vertices
		if (v.length == 0) { return '' }
		for (let point of v) {
			if (point == undefined || point.isNaN()) {
				pathString = ''
				return pathString
			}
			// move (M) to the first point, then connect the points with lines (L)
			let prefix: string = (pathString == '') ? 'M' : 'L'
			pathString += prefix + VMobject.stringFromPoint(point)
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



















