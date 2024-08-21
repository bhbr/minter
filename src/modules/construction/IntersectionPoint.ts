import { Point } from './../creations/Point'
import { ConstructedMobject } from '../mobject/expandable/ExpandableMobject'
import { Vertex } from '../helpers/Vertex'
import { Arrow } from '../arrows/Arrow'
import { Circle } from '../shapes/Circle'

export class IntersectionPoint extends Point {

	geomob1: ConstructedMobject
	geomob2: ConstructedMobject
	index: number
	fillOpacity: number = 0
	lambda: number = NaN
	mu: number = NaN

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			midpoint: new Vertex(NaN, NaN)
		})
	}

	updateModel(argsDict: object = {}) {
		let mp: Vertex = this.intersectionCoords()
		if (mp.isNaN() || !this.geomob1.visible || !this.geomob2.visible) {
			this.recursiveHide()
		} else {
			this.recursiveShow()
			if (!this.midpoint.equals(mp)) {
				argsDict['midpoint'] = mp
			}
		}
		super.updateModel(argsDict)
	}

	intersectionCoords(): Vertex {
		if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Circle) {
			return this.arrowCircleIntersection(this.geomob1, this.geomob2, this.index)
		} else if (this.geomob1 instanceof Circle && this.geomob2 instanceof Arrow) {
			return this.arrowCircleIntersection(this.geomob2, this.geomob1, this.index)
		} else if (this.geomob1 instanceof Arrow && this.geomob2 instanceof Arrow) {
			return this.arrowArrowIntersection(this.geomob1, this.geomob2)
		} else if (this.geomob1 instanceof Circle && this.geomob2 instanceof Circle) {
			return this.circleCircleIntersection(this.geomob1, this.geomob2, this.index)
		} else {
			return new Vertex(NaN, NaN)
		}
	}

	arrowCircleIntersection(arrow: Arrow, circle: Circle, index: number): Vertex {
		let A: Vertex = arrow.startPoint
		let B: Vertex = arrow.endPoint
		let C: Vertex = circle.midpoint
		let r: number = circle.radius

		let a: number = A.subtract(B).norm2()
		let b: number = 2 * C.subtract(A).dot(A.subtract(B))
		let c: number = C.subtract(A).norm2() - r**2
		let d: number = b**2 - 4*a*c

		this.lambda = (-b + (index == 0 ? -1 : 1) * d**0.5)/(2*a)
		let P: Vertex = A.add(B.subtract(A).multiply(this.lambda))
		if (arrow.constructor.name == 'Segment') {
			if (this.lambda < 0 || this.lambda > 1) { P = new Vertex(NaN, NaN) }
		} else if (arrow.constructor.name == 'Ray') {
			if (this.lambda < 0) { P = new Vertex(NaN, NaN) }
		}
		return P
	}

	arrowArrowIntersection(arrow1: Arrow, arrow2: Arrow) {

		let A: Vertex = arrow1.startPoint
		let B: Vertex = arrow1.endPoint
		let C: Vertex = arrow2.startPoint
		let D: Vertex = arrow2.endPoint

		let AB = B.subtract(A)
		let CD = D.subtract(C)
		let AC = C.subtract(A)

		let det: number = (AB.x*CD.y - AB.y*CD.x)
		if (det == 0) { return new Vertex(NaN, NaN) } // parallel lines
		this.lambda = (CD.y*AC.x - CD.x*AC.y)/det
		this.mu = (AB.y*AC.x - AB.x*AC.y)/det
		let Q: Vertex = A.add(AB.multiply(this.lambda))

		let intersectionFlag1: boolean = (arrow1.constructor.name == 'Segment' && this.lambda >= 0 && this.lambda <= 1) || (arrow1.constructor.name == 'Ray' && this.lambda >= 0) || (arrow1.constructor.name == 'Line')
		let intersectionFlag2: boolean = (arrow2.constructor.name == 'Segment' && this.mu >= 0 && this.mu <= 1) || (arrow2.constructor.name == 'Ray' && this.mu >= 0) || (arrow2.constructor.name == 'Line')

		return (intersectionFlag1 && intersectionFlag2) ? Q : new Vertex(NaN, NaN)

	}

	circleCircleIntersection(circle1: Circle, circle2: Circle, index: number) {

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


