
import { ConStraitConstructor } from '../ConStraitConstructor'
import { ConRay } from './ConRay'

export class ConRayConstructor extends ConStraitConstructor {

	ray: ConRay

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'ray'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			ray: new ConRay()
		})
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