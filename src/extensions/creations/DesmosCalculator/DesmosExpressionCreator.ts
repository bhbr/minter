
import { DesmosExpression } from './DesmosExpression'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'

export class DesmosExpressionCreator extends DraggingCreator {

	declare creation: DesmosExpression

	createMobject(): DesmosExpression {
		return new DesmosExpression({
			anchor: this.getStartPoint()
		})
	}

	// updateFromTip(q: vertex, redraw: boolean = true) {
	// 	super.updateFromTip(q, redraw)
	// 	this.creation.hideLinks()
	// }

}
