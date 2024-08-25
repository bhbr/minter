import { Vertex } from '../helpers/Vertex'
import { ScreenEventHandler } from '../mobject/screen_events'
import { FreePoint } from './FreePoint'
import { Paper } from '../../Paper'
import { Mobject } from '../mobject/Mobject'
import { Construction } from '../mobject/expandable/ExpandableMobject_Construction'
import { ConstructingMobject } from './ConstructingMobject'
import { log } from '../helpers/helpers'
import { ConstructionPoint } from './ConstructionPoint'

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
		let sp = this.construction.snappedPointForVertex(this.startPoint)
		log(`this.startPoint: ${this.startPoint}`)
		log(`sp: ${sp}`)
		if (sp !== null) {
			log(sp.midpoint)
		}
		let sp1 = (sp === null) ? this.startPoint : sp.midpoint
		
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.endPoint = this.endPoint ?? sp1.copy()
		this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.startFreePoint, 'fillColor')
		this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.endFreePoint, 'fillColor')
		this.addDependency('endPoint', this.endFreePoint, 'midpoint')

		log(`before: ${this.startFreePoint.midpoint}`)
		this.startFreePoint.update({ midpoint: sp1 })
		log(`after: ${this.startFreePoint.midpoint}`)
		this.endFreePoint.update({ midpoint: this.endPoint })
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.update()
	}

	dissolve() {
		this.construction.integrate(this)
	}

}