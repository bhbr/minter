import { SpanningCreator } from 'core/creators/SpanningCreator'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Board } from 'core/boards/Board'
import { Construction } from 'extensions/boards/construction/Construction'

export class ConstructionCreator extends SpanningCreator {

	declare creation?: Construction

	createMobject(): Construction {
		let c = new Construction({
			compactAnchor: this.topLeftVertex(),
			compactWidth: this.getWidth(),
			compactHeight: this.getHeight()
		})
		c.contractStateChange()
		return c
	}
	
}