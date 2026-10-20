
import { SpanningCreator } from 'creators/SpanningCreator.js'
import { vertex } from '@bhbr/affr2'
import { Board } from 'boards/Board.js'
import { Construction } from 'extensions/boards/construction/Construction.js'

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