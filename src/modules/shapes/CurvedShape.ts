import { VMobject } from '../mobject/VMobject'
import { Vertex } from '../helpers/Vertex_Transform'
import { stringFromPoint } from '../helpers/helpers'

export class CurvedShape extends VMobject {

	_bezierPoints: Array<Vertex>

	updateBezierPoints() { }
	// implemented by subclasses

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.updateBezierPoints()
	}

	static makePathString(bezierPoints: Array<Vertex>): string {
		let points: Array<Vertex> = bezierPoints
		if (points == undefined || points.length == 0) { return '' }

		// there should be 3n+1 points
		let nbCurves: number = (points.length - 1)/3
		if (nbCurves % 1 != 0) { throw 'Incorrect number of Bézier points' }

		let pathString: string = 'M' + stringFromPoint(points[0])
		for (let i = 0; i < nbCurves; i++) {
			let point1str: string = stringFromPoint(points[3*i + 1])
			let point2str: string = stringFromPoint(points[3*i + 2])
			let point3str: string = stringFromPoint(points[3*i + 3])
			pathString += 'C' + point1str + ' ' + point2str + ' ' + point3str
		}
		pathString += 'Z'
		return pathString
	}

	pathString(): string {
		return CurvedShape.makePathString(this.bezierPoints)
	}

	get bezierPoints(): Array<Vertex> { return this._bezierPoints }
	set bezierPoints(newValue: Array<Vertex>) {
		this._bezierPoints = newValue
		let v: Array<Vertex> = []
		let i: number = 0
		for (let p of this.bezierPoints) {
			if (i % 3 == 1) { v.push(p) }
			i += 1
		}
		this.vertices = v
	}


	///////////////
	// ANIMATION //
	///////////////

	animatableProperties(): Array<string> {
		return super.animatableProperties().concat([
			'bezierPoints'
		])
	}
		
	animate(argsDict: object = {}, seconds: number) {
		super.animate(argsDict, seconds)
	}

	morphTo(newShape: CurvedShape, seconds: number) {
		if (newShape.constructor.name != this.constructor.name
			|| newShape.bezierPoints.length != this.bezierPoints.length) {
			console.error('Morphing not possible')
			return
		}
	}
	





}