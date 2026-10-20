
import { vertex, vertexCopy } from '@bhbr/affr2'
import { FreePoint } from '../FreePoint.js'
import { Construction } from '../Construction.js'
import { Constructor } from '../Constructor.js'
import { ConPoint } from '../ConPoint.js'
import { log } from 'functions/logging.js'

export class ConStraitConstructor extends Constructor {

	startFreePoint: FreePoint
	endFreePoint: FreePoint

	defaults(): object {
		return {
			startFreePoint: new FreePoint(),
			endFreePoint: new FreePoint()
		}
	}

	mutabilities(): object {
		return {
			startFreePoint: 'never',
			endFreePoint: 'never'
		}
	}

	setup() {
		log('setup')
		super.setup()
		log(`${this.getStartPoint()} ${this.getEndPoint()}`)
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
		if (redraw) { this.view.redraw() }
	}

}