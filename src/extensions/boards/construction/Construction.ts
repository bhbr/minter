
// imports for Construction
import { ConPoint } from './ConPoint'
import { FreePoint } from './FreePoint'
import { Constructor } from './Constructor'
import { ConLineConstructor } from './straits/ConLine/ConLineConstructor'
import { ConRayConstructor } from './straits/ConRay/ConRayConstructor'
import { ConSegmentConstructor } from './straits/ConSegment/ConSegmentConstructor'
import { ConStraitConstructor } from './straits/ConStraitConstructor'
import { ConCircleConstructor } from './ConCircle/ConCircleConstructor'
import { ConStrait } from './straits/ConStrait'
import { ConLine } from './straits/ConLine/ConLine'
import { ConRay } from './straits/ConRay/ConRay'
import { ConSegment } from './straits/ConSegment/ConSegment'
import { ConCircle } from './ConCircle/ConCircle'
import { Circle } from 'core/shapes/Circle'
import { IntersectionPoint } from './IntersectionPoint'
import { ColorSampleCreator } from 'extensions/creations/ColorSample/ColorSampleCreator'
import { Board } from 'core/boards/Board'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Creator } from 'core/creators/Creator'
import { ScreenEventDevice, screenEventDevice, ScreenEventHandler, ScreenEvent, eventVertex, isTouchDevice } from 'core/mobjects/screen_events'
import { Mobject } from 'core/mobjects/Mobject'
import { convertArrayToString } from 'core/functions/arrays'
import { getPaper } from 'core/functions/getters'

export type ConMobject = ConStrait | ConCircle
export type ConstructingConMobject = ConStraitConstructor | ConCircleConstructor

export class Construction extends Board {
	
	points: Array<ConPoint>
	constructedMobjects: Array<ConMobject>
	declare Creator: ConstructingConMobject

	defaults(): object {
		return Object.assign(super.defaults(), {
			points: [],
			constructedMobjects: [],
			buttonNames: [
				'DragButton',
				'StraitButton',
				'ConCircleButton'
			]
		})
	}

	setup() {
		super.setup()
		this.view.style.overflow = 'hidden'
		this.background.update({
			fillColor: Color.black()
		})
	}

	snapped(v1: Vertex, v2: Vertex): boolean {
		return v1.closeTo(v2, 10)
	}

	snappedPointForVertex(v: Vertex): ConPoint | null {
		for (let p of this.points) {
			if (this.snapped(v, p.midpoint)) { return p }
		}
		return null
	}

	addPoint(p: ConPoint): boolean {
		for (let q of this.points) {
			if (this.snapped(p.midpoint, q.midpoint)) {
				return false
			}
		}
		this.add(p)
		this.points.push(p)
		return true
	}

	freePoints(): Array<FreePoint> {
		let ret: Array<FreePoint> = []
		for (let p of this.points) {
			if (p instanceof FreePoint) {
				ret.push(p)
			}
		}
		return ret
	}

	createCreator(type: string): Creator {
		switch (type) {
			case 'segment':
				let sg = new ConSegmentConstructor({
					creationStroke: this.creationStroke,
					construction: this
				})
				return sg
			case 'ray':
				let ray = new ConRayConstructor({
					creationStroke: this.creationStroke,
					construction: this
				})
				return ray
			case 'line':
				let line = new ConLineConstructor({
					creationStroke: this.creationStroke,
					construction: this
				})
				return line
			case 'circle':
				let c = new ConCircleConstructor({
					creationStroke: this.creationStroke,
					construction: this
				})
				return c
		}
		return super.createCreator(type)
	}

	startCreating(e: ScreenEvent) {
		let v = this.localEventVertex(e)
		let p: ConPoint | null = this.snappedPointForVertex(v)
		if (this.creationMode == 'freehand') {
			if (p === null) { // starting a freehand drawing
				super.startCreating(e)
			} else if (p instanceof FreePoint) { // dragging a free point
				this.eventTarget = p
				p.startDragging(e)
			} // hitting any other point does nothing if in freehand mode
			return
		}
		this.creationStroke.push(v)
		this.Creator = this.createCreator(this.creationMode) as ConstructingConMobject
		this.add(this.Creator)

	}

	creating(e: ScreenEvent) {
		if (this.creationMode == 'freehand') {
			super.creating(e)
			return
		}
		let p: Vertex = this.localEventVertex(e)
		for (let fq of this.points) {
			let q: Vertex = fq.midpoint
			if (this.snapped(p, q)) {
				p = q
				break
			}
		}
		this.Creator.updateFromTip(p)
	}

	addToContent(mob: Mobject) {
		super.addToContent(mob)
		if (mob instanceof ConPoint) {
			this.points.push(mob)
			if (mob instanceof FreePoint && !this.points.includes(mob)) {
				this.points.push(mob)
			}
		}
	}




	integrate(mob: ConstructingConMobject) {
		this.remove(mob)
		let p1: ConPoint = this.snappedPointForVertex(mob.startPoint) ?? new FreePoint({ midpoint: mob.startPoint })
		let p2: ConPoint = this.snappedPointForVertex(mob.endPoint) ?? new FreePoint({ midpoint: mob.endPoint })
		this.addToContent(p1)
		this.addToContent(p2)

		let cm: ConMobject
		if (mob instanceof ConSegmentConstructor) {
			cm = mob.segment
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConRayConstructor) {
			cm = mob.ray
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConLineConstructor) {
			cm = mob.line
			p1.addDependency('midpoint', cm, 'startPoint')
			p2.addDependency('midpoint', cm, 'endPoint')
		} else if (mob instanceof ConCircleConstructor) {
			cm = mob.circle
			p1.addDependency('midpoint', cm, 'midpoint')
			p2.addDependency('midpoint', cm, 'outerPoint')
		}
		this.add(cm)
		this.intersectWithRest(cm)
		this.constructedMobjects.push(cm)
		p1.update({ strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor })
		p2.update({ strokeColor: mob.penStrokeColor, fillColor: mob.penFillColor })
	}

	intersectWithRest(geomob1: ConMobject) {
		for (let geomob2 of this.constructedMobjects) {
			if (geomob1 == geomob2) { continue }
			let nbPoints: number = (geomob1 instanceof ConStrait && geomob2 instanceof ConStrait) ? 1 : 2
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

	onPointerDown(e: ScreenEvent) {
		if (this.creationMode != 'freehand') {
			super.onPointerDown(e)
			return
		}
		if (this.contracted) { return }
		let v = this.localEventVertex(e)
		let p = this.snappedPointForVertex(v)
		if (p !== null) {
			getPaper().eventTarget = p
			p.startDragging(e)
		} else {
			this.startCreating(e)
		}

	}

}























