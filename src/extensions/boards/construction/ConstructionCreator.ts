import { SpanningCreator } from 'core/creators/SpanningCreator'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Board } from 'core/boards/Board'
import { Construction } from 'extensions/boards/construction/Construction'

export class ConstructionCreator extends SpanningCreator {

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