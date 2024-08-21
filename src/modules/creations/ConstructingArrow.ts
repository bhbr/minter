import { Vertex } from '../helpers/Vertex'
import { ScreenEventHandler } from '../mobject/screen_events'
import { FreePoint } from './FreePoint'
import { Paper } from '../../Paper'
import { Mobject } from '../mobject/Mobject'
import { Construction } from '../mobject/expandable/ExpandableMobject'
import { ConstructingMobject } from './ConstructingMobject'

export class ConstructingArrow extends ConstructingMobject {

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

	dissolve() {
		this.parent.integrate(this)
	}

}