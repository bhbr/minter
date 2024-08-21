import { VMobject } from '../mobject/VMobject'
import { Vertex } from '../helpers/Vertex'
import { VertexArray } from '../helpers/VertexArray'
import { stringFromPoint } from '../helpers/helpers'

export class CurvedLine extends VMobject {

	_bezierPoints: VertexArray
	closed: boolean

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

		let pathString: string = 'M' + stringFromPoint(points[0])
		for (let i = 0; i < nbCurves; i++) {
			let point1str: string = stringFromPoint(points[3 * i + 1])
			let point2str: string = stringFromPoint(points[3 * i + 2])
			let point3str: string = stringFromPoint(points[3 * i + 3])
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





}