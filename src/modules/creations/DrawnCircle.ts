import { LocatedEvent, PointerEventPolicy, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, isTouchDevice, eventVertex } from '../mobject/pointer_events'
import { log } from '../helpers/helpers'
import { Vertex } from '../helpers/Vertex_Transform'
import { Mobject } from '../mobject/Mobject'
import { MGroup } from '../mobject/MGroup'
import { Polygon } from '../shapes/Polygon'
import { Color } from '../helpers/Color'
import { Circle } from '../shapes/Circle'
import { TwoPointCircle } from '../shapes/TwoPointCircle'
import { Arrow } from '../arrows/Arrow'
import { Segment } from '../arrows/Segment'
import { Ray } from '../arrows/Ray'
import { Line } from '../arrows/Line'
import { Paper } from '../../paper'
import { DrawnMobject } from './DrawnMobject'
import { FreePoint } from './FreePoint'

export class DrawnCircle extends DrawnMobject {

	midpoint: Vertex
	outerPoint: Vertex
	freeMidpoint: FreePoint
	freeOuterPoint: FreePoint
	circle: TwoPointCircle


	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			strokeWidth: 1,
			fillOpacity: 0
		})
	}


	statelessSetup() {
		super.statelessSetup()
		this.freeMidpoint = new FreePoint()
		this.freeOuterPoint = new FreePoint()
		this.circle = new TwoPointCircle()

	}

	statefulSetup() {
		super.statefulSetup()

		this.midpoint = this.midpoint || this.startPoint.copy()
		this.outerPoint = this.outerPoint || this.startPoint.copy()

		this.add(this.freeMidpoint)
		this.add(this.freeOuterPoint)
		this.add(this.circle)

		this.addDependency('penStrokeColor', this.freeMidpoint, 'strokeColor')
		this.addDependency('penFillColor', this.freeMidpoint, 'fillColor')
		this.addDependency('penStrokeColor', this.freeOuterPoint, 'strokeColor')
		this.addDependency('penFillColor', this.freeOuterPoint, 'fillColor')
		this.addDependency('penStrokeColor', this.circle, 'strokeColor')

		this.freeMidpoint.addDependency('midpoint', this.circle, 'midpoint')
		this.freeOuterPoint.addDependency('midpoint', this.circle, 'outerPoint')


		this.freeMidpoint.update({
			midpoint: this.midpoint,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		}, false)
		this.freeOuterPoint.update({
			midpoint: this.outerPoint,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		}, false)
		this.circle.update({
			midpoint: this.freeMidpoint.midpoint,
			outerPoint: this.freeOuterPoint.midpoint,
			fillOpacity: 0
		}, false)
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.outerPoint.copyFrom(q)
		this.freeOuterPoint.midpoint.copyFrom(q)
		this.update()
	}

	dissolveInto(paper: Paper) {
		paper.construction.integrate(this)
	}

	// remove?
	update(argsDict: object = {}, redraw: boolean = true) {
		super.update(argsDict, redraw)
	}


}

















