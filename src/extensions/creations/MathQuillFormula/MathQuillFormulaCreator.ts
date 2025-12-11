
import { MathQuillFormula } from './MathQuillFormula'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class MathQuillFormulaCreator extends DraggingCreator {

	declare creation: MathQuillFormula

	defaults(): object {
		return {
			helpText: 'An algebraic expression. Input variables are detected automatically. You can define the name of the output variable using an equals sign.',
			pointOffset: [-20, -50]
		}
	}

	createMobject(): MathQuillFormula {
		return new MathQuillFormula({
			anchor: this.getStartPoint()
		})
	}
}