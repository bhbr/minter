
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { Board } from './Board'
import { vertex } from 'core/functions/vertex'


export class BoardCreator extends SpanningCreator {

	declare creation?: Board

	createMobject(): Board {
		//let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y))
		let topLeft = this.topLeftVertex()
		let cm = new Board({
			compactAnchor: topLeft,
			compactWidth: this.getWidth(),
			compactHeight: this.getHeight()
		})
		cm.contractStateChange()
		cm.expandButton.show()
		return cm
	}

}