
import { VMobject } from './VMobject'
import { vertexArray, vertexIsNaN } from 'core/functions/vertex'

export class PolygonalLine extends VMobject {
	/*
	In a polygon, the array this.points describes the vertices connected by straight lines.
	*/

	closed: boolean

	ownDefaults(): object {
		return {
			closed: true,
			fillOpacity: 0
		}
	}

	ownMutabilities(): object {
		return {
			closed: 'on_init'
		}
	}

	static makePathString(vertices: vertexArray, closed: boolean): string {
		let pathString: string = ''
		let v = vertices
		if (v.length == 0) { return '' }
		for (let point of v) {
			if (point == undefined || vertexIsNaN(point)) {
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
		return PolygonalLine.makePathString(this.vertices, this.closed)
	}
	
}



















