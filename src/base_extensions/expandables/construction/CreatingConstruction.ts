import { CreatingBox } from 'core/mobject/creating/CreatingBox'
import { Vertex } from 'core/helpers/Vertex'
import { ExpandableMobject, Construction } from 'core/mobject/expandable/ExpandableMobject_Construction'

export class CreatingConstruction extends CreatingBox {

	declare creation?: Construction

	createMobject(): Construction {
		let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y))
		let c = new Construction({
			compactAnchor: topLeft,
			compactWidth: this.getWidth(),
			compactHeight: this.getHeight()
		})
		c.contractStateChange()
		return c
	}
	
}