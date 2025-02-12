
import { vertex, vertexCopy } from 'core/functions/vertex'
import { FreePoint } from '../FreePoint'
import { Construction } from '../Construction'
import { Constructor } from '../Constructor'
import { ConPoint } from '../ConPoint'

export class ConStraitConstructor extends Constructor {

	startFreePoint: FreePoint
	endFreePoint: FreePoint

	ownDefaults(): object {
		return {
			startFreePoint: new FreePoint(),
			endFreePoint: new FreePoint()
		}
	}

	ownMutabilities(): object {
		return {
			startFreePoint: 'never',
			endFreePoint: 'never'
		}
	}

	setup() {
		super.setup()
		let sp = this.construction.snappedPointForVertex(this.getStartPoint())
		let sp1 = (sp === null) ? this.getStartPoint() : sp.midpoint
		
		this.add(this.startFreePoint)
		this.add(this.endFreePoint)
		this.addDependency('penStrokeColor', this.startFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.startFreePoint, 'fillColor')
		this.addDependency('penStrokeColor', this.endFreePoint, 'strokeColor')
		this.addDependency('penFillColor', this.endFreePoint, 'fillColor')
		this.addDependency('getEndPoint', this.endFreePoint, 'midpoint')

		this.startFreePoint.update({ midpoint: sp1 })
		this.endFreePoint.update({
			midpoint: this.getEndPoint() ?? vertexCopy(sp1)
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, redraw)
		this.update()
		if (redraw) { this.redraw() }
	}

}