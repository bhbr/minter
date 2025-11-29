
import { DesmosExpression } from './DesmosExpression'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'

export class DesmosExpressionCreator extends DraggingCreator {

	declare creation: DesmosExpression

	defaults(): object {
		return {
			helpText: 'An algebraic expression. Input variables are detected automatically. You can define the name of the output variable using an equals sign.',
			pointOffset: [-300, -100]
		}
	}

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
