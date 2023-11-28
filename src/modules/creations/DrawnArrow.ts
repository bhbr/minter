import { Vertex } from '../helpers/Vertex_Transform'
import { DrawnMobject } from './DrawnMobject'
import { PointerEventPolicy } from '../mobject/pointer_events'
import { FreePoint } from './FreePoint'
import { Paper } from '../../Paper'
import { Mobject } from '../mobject/Mobject'
import { Construction } from '../construction/Construction'

export class DrawnArrow extends DrawnMobject {

	startFreePoint: FreePoint
	endFreePoint: FreePoint

	statelessSetup() {
		super.statelessSetup()

		this.startFreePoint = new FreePoint()
		this.endFreePoint = new FreePoint()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.endPoint = this.endPoint ?? this.startPoint.copy()
		this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.startFreePoint, 'fillColor')
		this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.endFreePoint, 'fillColor')
		this.addDependency('startPoint', this.startFreePoint, 'midpoint')
		this.addDependency('endPoint', this.endFreePoint, 'midpoint')
		this.startFreePoint.update({ midpoint: this.startPoint })
		this.endFreePoint.update({ midpoint: this.endPoint })
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.update()
	}

	dissolveInto(superMobject: Mobject) {
		(superMobject as Construction).integrate(this)
	}

}