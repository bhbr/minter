
import { MathExpressionField } from './MathExpressionField'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class MathExpressionFieldCreator extends DraggingCreator {

	declare creation: MathExpressionField

	defaults(): object {
		return {
			helpText: 'An algebraic expression. Input variables are detected automatically. You can define the name of the output variable using an equals sign.',
			pointOffset: [-20, -50]
		}
	}

	createMobject(): MathExpressionField {
		return new MathExpressionField({
			anchor: this.getStartPoint()
		})
	}
}