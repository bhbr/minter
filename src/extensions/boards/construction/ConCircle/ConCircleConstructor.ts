
import { Vertex } from 'core/classes/vertex/Vertex'
import { ConCircle } from './ConCircle'
import { Constructor } from '../Constructor'
import { FreePoint } from '../FreePoint'
import { Construction } from '../Construction'

export class ConCircleConstructor extends Constructor {

	freeMidpoint: FreePoint
	freeOuterPoint: FreePoint
	circle: ConCircle

	defaults(): object {
		return Object.assign(super.defaults(), {
			strokeWidth: 1,
			fillOpacity: 0,
			freeMidpoint : new FreePoint(),
			freeOuterPoint: new FreePoint(),
			circle: new ConCircle()
		})
	}

	setup() {
		super.setup()

		let sp = this.construction.snappedPointForVertex(this.startPoint)
		let sp1 = (sp === null) ? this.startPoint : sp.midpoint

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
			midpoint: sp1,
			strokeColor: this.penStrokeColor,
			fillColor: this.penFillColor
		}, false)
		this.freeOuterPoint.update({
			midpoint: this.endPoint,
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
		this.freeOuterPoint.update({ midpoint: q })
		this.update()
	}

	dissolve() {
		this.construction.integrate(this)
	}

	// remove?
	update(argsDict: object = {}, redraw: boolean = true) {
		super.update(argsDict, redraw)
	}


}

















