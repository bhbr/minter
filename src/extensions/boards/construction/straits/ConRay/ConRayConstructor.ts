
import { ConStraitConstructor } from '../ConStraitConstructor.js'
import { ConRay } from './ConRay.js'

export class ConRayConstructor extends ConStraitConstructor {

	ray: ConRay

	defaults(): object {
		return {
			ray: new ConRay()
		}
	}

	mutabilities(): object {
		return {
			ray: 'never'
		}
	}

	setup() {
		super.setup()
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