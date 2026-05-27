
import { ConPoint } from './ConPoint'
import { ConMobject } from './Construction'
import { vertex, vertexIsNaN, vertexEquals, vertexAdd, vertexSubtract, vertexMultiply, vertexNorm2, vertexDot } from 'core/functions/vertex'
import { ConStrait } from './straits/ConStrait'
import { ConCircle } from './ConCircle/ConCircle'
import { Color } from 'core/classes/Color'

export class IntersectionPoint extends ConPoint {

	conMob1: ConMobject
	conMob2: ConMobject
	index: number
	lambda: number = NaN
	mu: number = NaN

	defaults(): object {
		return {
			fillOpacity: 0,
			conMob1: undefined,
			conMob2: undefined,
			index: undefined,
			midpoint: [NaN, NaN]
		}
	}

	mutabilities(): object {
		return {
			fillOpacity: 'never',
			conMob1: 'on_init',
			conMob2: 'on_init',
			index: 'on_init'
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		let mp: vertex = this.intersectionCoords()
		if (vertexIsNaN(mp) || !this.conMob1.view.visible || !this.conMob2.view.visible) {
			this.view.hide()
			this.hideDependents()
		} else {
			this.view.show()
			this.showDependents()
			if (!vertexEquals(this.midpoint, mp)) {
				args['midpoint'] = mp
			}
		}
		super.update(args, redraw)
	}

	intersectionCoords(): vertex {
		if (this.conMob1 instanceof ConStrait && this.conMob2 instanceof ConCircle) {
			return this.arrowCircleIntersection(this.conMob1, this.conMob2, this.index)
		} else if (this.conMob1 instanceof ConCircle && this.conMob2 instanceof ConStrait) {
			return this.arrowCircleIntersection(this.conMob2, this.conMob1, this.index)
		} else if (this.conMob1 instanceof ConStrait && this.conMob2 instanceof ConStrait) {
			return this.arrowArrowIntersection(this.conMob1, this.conMob2)
		} else if (this.conMob1 instanceof ConCircle && this.conMob2 instanceof ConCircle) {
			return this.circleCircleIntersection(this.conMob1, this.conMob2, this.index)
		} else {
			return [NaN, NaN]
		}
	}

	arrowCircleIntersection(strait: ConStrait, circle: ConCircle, index: number): vertex {
		let A: vertex = strait.startPoint
		let B: vertex = strait.endPoint
		let C: vertex = circle.midpoint
		let r: number = circle.radius

		let a: number = vertexNorm2(vertexSubtract(A, B))
		let b: number = 2 * vertexDot(vertexSubtract(C, A), vertexSubtract(A, B))
		let c: number = vertexNorm2(vertexSubtract(C, A)) - r ** 2
		let d: number = b ** 2 - 4 * a * c

		this.lambda = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a)
		let P: vertex = vertexAdd(A, vertexMultiply(vertexSubtract(B, A), this.lambda))
		if (strait.constructor.name == 'ConSegment') {
			if (this.lambda < 0 || this.lambda > 1) { P = [NaN, NaN] }
		} else if (strait.constructor.name == 'ConRay') {
			if (this.lambda < 0) { P = [NaN, NaN] }
		}
		return P
	}

	arrowArrowIntersection(strait1: ConStrait, strait2: ConStrait) {

		let A: vertex = strait1.startPoint
		let B: vertex = strait1.endPoint
		let C: vertex = strait2.startPoint
		let D: vertex = strait2.endPoint

		let AB = vertexSubtract(B, A)
		let CD = vertexSubtract(D, C)
		let AC = vertexSubtract(C, A)

		let det: number = (AB[0] * CD[1] - AB[1] * CD[0])
		if (det == 0) { return [NaN, NaN] } // parallel lines
		this.lambda = (CD[1] * AC[0] - CD[0] * AC[1]) / det
		this.mu = (AB[1] * AC[0] - AB[0] * AC[1]) / det
		let Q: vertex = vertexAdd(A, vertexMultiply(AB, this.lambda))

		let intersectionFlag1: boolean =
			(strait1.constructor.name == 'ConSegment' && this.lambda >= 0 && this.lambda <= 1)
			|| (strait1.constructor.name == 'ConRay' && this.lambda >= 0)
			|| (strait1.constructor.name == 'ConLine')
		let intersectionFlag2: boolean =
			(strait2.constructor.name == 'ConSegment' && this.mu >= 0 && this.mu <= 1)
			|| (strait2.constructor.name == 'ConRay' && this.mu >= 0)
			|| (strait2.constructor.name == 'ConLine')

		return (intersectionFlag1 && intersectionFlag2) ? Q : [NaN, NaN]

	}

	circleCircleIntersection(circle1: ConCircle, circle2: ConCircle, index: number) {

		let A: vertex = circle1.midpoint
		let B: vertex = circle2.midpoint
		let r1: number = circle1.radius
		let r2: number = circle2.radius

		let R: number = 0.5 * (r1 ** 2 - r2 ** 2 - vertexNorm2(A) + vertexNorm2(B))
		let r: number = (A[0] - B[0])/(B[1] - A[1])
		let s: number = R / (B[1] - A[1])

		let a: number = 1 + r ** 2
		let b: number = 2 * (r * s - A[0] - r * A[1])
		let c: number = (A[1] - s) ** 2 + A[0] ** 2 - r1 ** 2
		let d: number = b ** 2 - 4 * a * c

		let x: number = (-b + (index == 0 ? -1 : 1) * d ** 0.5) / (2 * a)
		let y: number = r * x + s
		let p: vertex = [x, y]
		return p

	}

}


