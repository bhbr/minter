import { CreatingBox } from '../creating/CreatingBox'
import { ExpandableMobject } from './ExpandableMobject_Construction'
import { Vertex } from 'core/helpers/Vertex'


export class CreatingExpandableMobject extends CreatingBox {

	declare creation?: ExpandableMobject

	createMobject(): ExpandableMobject {
		let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y))
		let cm = new ExpandableMobject({
			compactAnchor: topLeft,
			compactWidth: this.getWidth(),
			compactHeight: this.getHeight()
		})
		cm.contractStateChange()
		return cm
	}

}