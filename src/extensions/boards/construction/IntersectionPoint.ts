
import { ConPoint } from './ConPoint'
import { ConMobject } from './Construction'
import { Vertex } from 'core/classes/vertex/Vertex'
import { ConStrait } from './straits/ConStrait'
import { ConCircle } from './ConCircle/ConCircle'

export class IntersectionPoint extends ConPoint {

	conMob1: ConMobject
	conMob2: ConMobject
	index: number
	fillOpacity: number = 0
	lambda: number = NaN
	mu: number = NaN

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			fillOpacity: 1,
			conMob1: undefined,
			conMob2: undefined,
			index: undefined,
			midpoint: new Vertex(NaN, NaN)
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			fillOpacity: 'never',
			conMob1: 'never',
			conMob2: 'never',
			index: 'never'
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		let mp: Vertex = this.intersectionCoords()
		if (mp.isNaN() || !this.conMob1.visible || !this.conMob2.visible) {
			this.recursiveHide()
		} else {
			this.recursiveShow()
			if (!this.midpoint.equals(mp)) {
				args['midpoint'] = mp
			}
		}
		super.update(args, redraw)
	}

	intersectionCoords(): Vertex {
		if (this.conMob1 instanceof ConStrait && this.conMob2 instanceof ConCircle) {
			return this.arrowCircleIntersection(this.conMob1, this.conMob2, this.index)
		} else if (this.conMob1 instanceof ConCircle && this.conMob2 instanceof ConStrait) {
			return this.arrowCircleIntersection(this.conMob2, this.conMob1, this.index)
		} else if (this.conMob1 instanceof ConStrait && this.conMob2 instanceof ConStrait) {
			return this.arrowArrowIntersection(this.conMob1, this.conMob2)
		} else if (this.conMob1 instanceof ConCircle && this.conMob2 instanceof ConCircle) {
			return this.circleCircleIntersection(this.conMob1, this.conMob2, this.index)
		} else {
			return new Vertex(NaN, NaN)
		}
	}

	arrowCircleIntersection(strait: ConStrait, circle: ConCircle, index: number): Vertex {
		let A: Vertex = strait.startPoint
		let B: Vertex = strait.endPoint
		let C: Vertex = circle.midpoint
		let r: number = circle.radius

		let a: number = A.subtract(B).norm2()
		let b: number = 2 * C.subtract(A).dot(A.subtract(B))
		let c: number = C.subtract(A).norm2() - r**2
		let d: number = b**2 - 4*a*c

		this.lambda = (-b + (index == 0 ? -1 : 1) * d**0.5)/(2*a)
		let P: Vertex = A.add(B.subtract(A).multiply(this.lambda))
		if (strait.constructor.name == 'ConLine') {
			if (this.lambda < 0 || this.lambda > 1) { P = new Vertex(NaN, NaN) }
		} else if (strait.constructor.name == 'ConRay') {
			if (this.lambda < 0) { P = new Vertex(NaN, NaN) }
		}
		return P
	}

	arrowArrowIntersection(strait1: ConStrait, strait2: ConStrait) {

		let A: Vertex = strait1.startPoint
		let B: Vertex = strait1.endPoint
		let C: Vertex = strait2.startPoint
		let D: Vertex = strait2.endPoint

		let AB = B.subtract(A)
		let CD = D.subtract(C)
		let AC = C.subtract(A)

		let det: number = (AB.x*CD.y - AB.y*CD.x)
		if (det == 0) { return new Vertex(NaN, NaN) } // parallel lines
		this.lambda = (CD.y*AC.x - CD.x*AC.y)/det
		this.mu = (AB.y*AC.x - AB.x*AC.y)/det
		let Q: Vertex = A.add(AB.multiply(this.lambda))

		let intersectionFlag1: boolean = (strait1.constructor.name == 'ConSegment' && this.lambda >= 0 && this.lambda <= 1) || (strait1.constructor.name == 'ConRay' && this.lambda >= 0) || (strait1.constructor.name == 'ConLine')
		let intersectionFlag2: boolean = (strait2.constructor.name == 'ConSegment' && this.mu >= 0 && this.mu <= 1) || (strait2.constructor.name == 'ConRay' && this.mu >= 0) || (strait2.constructor.name == 'ConLine')

		return (intersectionFlag1 && intersectionFlag2) ? Q : new Vertex(NaN, NaN)

	}

	circleCircleIntersection(circle1: ConCircle, circle2: ConCircle, index: number) {

		let A: Vertex = circle1.midpoint
		let B: Vertex = circle2.midpoint
		let r1: number = circle1.radius
		let r2: number = circle2.radius

		let R: number = 0.5*(r1**2 - r2**2 - A.norm2() + B.norm2())
		let r: number = (A.x - B.x)/(B.y - A.y)
		let s: number = R/(B.y - A.y)

		let a: number = 1 + r**2
		let b: number = 2*(r*s - A.x - r*A.y)
		let c: number = (A.y - s)**2 + A.x**2 - r1**2
		let d: number = b**2 - 4*a*c

		let x: number = (-b + (index == 0 ? -1 : 1) * d**0.5)/(2*a)
		let y: number = r*x + s
		let p: Vertex = new Vertex(x, y)
		return p

	}

}


