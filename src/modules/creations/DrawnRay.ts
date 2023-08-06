import { DrawnArrow } from './DrawnArrow'
import { Ray } from '../arrows/Ray'

export class DrawnRay extends DrawnArrow {

	ray: Ray

	statelessSetup() {
		super.statelessSetup()
		this.ray = new Ray()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.ray)
		this.ray.update({
			startPoint: this.startFreePoint.midpoint,
			endPoint: this.endFreePoint.midpoint
		} ,false)
		this.startFreePoint.addDependency('midpoint', this.ray, 'startPoint')
		this.endFreePoint.addDependency('midpoint', this.ray, 'endPoint')
		this.addDependency('penStrokeColor', this.ray, 'strokeColor')
	}

}