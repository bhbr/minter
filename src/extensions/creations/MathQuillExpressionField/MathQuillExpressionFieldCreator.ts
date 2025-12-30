
import { MathQuillExpressionField } from './MathQuillExpressionField'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class MathQuillExpressionFieldCreator extends DraggingCreator {

	declare creation: MathQuillExpressionField

	defaults(): object {
		return {
			helpText: 'An algebraic expression. Input variables are detected automatically. You can define the name of the output variable using an equals sign.',
			pointOffset: [-20, -50]
		}
	}

	createMobject(): MathQuillExpressionField {
		return new MathQuillExpressionField({
			anchor: this.getStartPoint()
		})
	}
}