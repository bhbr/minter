import { ConstructingConArrow } from '../ConstructingConArrow'
import { ConRay } from './ConRay'

export class ConstructingConRay extends ConstructingConArrow {

	ray: ConRay

	statelessSetup() {
		super.statelessSetup()
		this.ray = new ConRay()
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