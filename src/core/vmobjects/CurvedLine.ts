
import { VMobject } from './VMobject'
import { VertexArray } from 'core/classes/vertex/VertexArray'

export class CurvedLine extends VMobject {
	/*
	In a curved line, the array this.bezierPoints represents the vertices and control points:
	- this.bezierPoints[0, 3, 6, 9, ...] : vertices (synced with this.vertices)
	- this.bezierPoints[1, 4, 7, 10, ...] : forward ('left') control points
	- this.bezierPoints[2, 5, 8, 11, ...] : backward ('right') control points
	The array is wrapped in an accessor that keeps this.vertices in sync with it
	*/
	_bezierPoints: VertexArray
	get bezierPoints(): VertexArray { return this._bezierPoints }
	set bezierPoints(newValue: VertexArray) {
		this._bezierPoints = newValue
		let v = new VertexArray()
		let i: number = 0
		for (let p of this.bezierPoints) {
			if (i % 3 == 1) { v.push(p) }
			i += 1
		}
		this.vertices = v
	}

	closed: boolean // a closed CurvedLine is a CurvedShape

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			closed: false
		})
	}

	updateBezierPoints() { }
	// implemented by subclasses

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.updateBezierPoints()
	}

	static makePathString(bezierPoints: VertexArray, closed: boolean = false): string {
		let points: VertexArray = bezierPoints
		if (points == undefined || points.length == 0) { return '' }

		// there should be 3n + 1 points
		let nbCurves: number = (points.length - 1)/3
		if (nbCurves % 1 != 0) { throw 'Incorrect number of Bézier points' }

		// move to the first point
		let pathString: string = 'M' + VMobject.stringFromPoint(points[0])
		// next piece of Bézier curve defined by three points
		for (let i = 0; i < nbCurves; i++) {
			let point1str: string = VMobject.stringFromPoint(points[3 * i + 1])
			let point2str: string = VMobject.stringFromPoint(points[3 * i + 2])
			let point3str: string = VMobject.stringFromPoint(points[3 * i + 3])
			pathString += `C${point1str} ${point2str} ${point3str}`
		}
		if (closed) {
			pathString += 'Z'
		}
		return pathString
	}

	pathString(): string {
		return CurvedLine.makePathString(this.bezierPoints, this.closed)
	}

}





















