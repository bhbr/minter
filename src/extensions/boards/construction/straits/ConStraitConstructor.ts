
import { Vertex } from 'core/classes/vertex/Vertex'
import { FreePoint } from '../FreePoint'
import { Construction } from '../Construction'
import { Constructor } from '../Constructor'
import { ConPoint } from '../ConPoint'

export class ConStraitConstructor extends Constructor {

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
		let sp1 = (sp === null) ? this.startPoint : sp.midpoint
		
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.endPoint = this.endPoint ?? sp1.copy()
		this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.startFreePoint, 'fillColor')
		this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.endFreePoint, 'fillColor')
		this.addDependency('endPoint', this.endFreePoint, 'midpoint')

		this.startFreePoint.update({ midpoint: sp1 })
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