import { Point } from '../creations/Point'
import { FreePoint } from '../creations/FreePoint'
import { DrawnSegment } from '../creations/DrawnSegment'
import { DrawnRay } from '../creations/DrawnRay'
import { DrawnLine } from '../creations/DrawnLine'
import { DrawnArrow } from '../creations/DrawnArrow'
import { DrawnCircle } from '../creations/DrawnCircle'
import { Arrow } from '../arrows/Arrow'
import { Segment } from '../arrows/Segment'
import { Ray } from '../arrows/Ray'
import { Line } from '../arrows/Line'
import { Circle } from '../shapes/Circle'
import { TwoPointCircle } from '../shapes/TwoPointCircle'
import { CreatedMobject } from '../creations/CreatedMobject'
import { Vertex } from '../helpers/Vertex_Transform'
import { Color } from '../helpers/Color'
import { LocatedEvent, PointerEventPolicy, eventVertex } from '../mobject/pointer_events'
import { ExpandableMobject } from '../mobject/ExpandableMobject'
import { IntersectionPoint } from './IntersectionPoint'

export type ConstructedMobject = Arrow | TwoPointCircle

export class Construction extends ExpandableMobject {
	
	points: Array<Point>
	freePoints: Array<FreePoint>
	constructedMobjects: Array<ConstructedMobject>


	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			points: [],
			constructedMobjects: [],
			pointerEventPolicy: PointerEventPolicy.Pass
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			draggable: false,
			backgroundColor: Color.gray(0.1)
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.view.style.overflow = 'hidden'
	}

	integrate(mob: DrawnArrow | DrawnCircle) {
		let p1: Point = this.pointForVertex(mob.startPoint)
		let p2: Point = this.pointForVertex(mob.endPoint)

		let cm: ConstructedMobject
		if (mob instanceof DrawnSegment) {
			cm = mob.segment
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof DrawnRay) {
			cm = mob.ray
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof DrawnLine) {
			cm = mob.line
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof DrawnCircle) {
			cm = mob.circle
			p1.addDependency('midpoint', cm, 'midpoint')
			p2.addDependency('midpoint', cm, 'outerPoint')
		}
		this.add(cm)
		this.intersectWithRest(cm)
		this.constructedMobjects.push(cm)
		p1.update({strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor})
		p2.update({strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor})
	}

	pointForVertex(v: Vertex): Point {
		for (let p of this.points) {
			if (p.midpoint.equals(v)) { return p }
		}
		let p: FreePoint = new FreePoint({midpoint: v})
		this.addPoint(p)
		return p
	}

	addPoint(p: Point): boolean {
		for (let q of this.points) {
			if (p.midpoint.equals(q.midpoint)) {
				return false
			}
		}
		this.add(p)
		this.points.push(p)
		return true
	}

	intersectWithRest(geomob1: ConstructedMobject) {
		for (let geomob2 of this.constructedMobjects) {
			if (geomob1 == geomob2) { continue }
			let nbPoints: number = (geomob1 instanceof Arrow && geomob2 instanceof Arrow) ? 1 : 2
			for (let i = 0; i < nbPoints; i++) {
				let p: IntersectionPoint = new IntersectionPoint({
					geomob1: geomob1,
					geomob2: geomob2,
					index: i
				})
				let isNewPoint: boolean = this.addPoint(p)
				if (isNewPoint) {
					geomob1.addDependent(p)
					geomob2.addDependent(p)
				}
			}
		}
	}

}