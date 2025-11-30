
import { MathQuillFormula } from './MathQuillFormula'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class MathQuillFormulaCreator extends DraggingCreator {

	declare creation: MathQuillFormula

	defaults(): object {
		return {
			pointOffset: [-20, -50]
		}
	}

	createMobject(): MathQuillFormula {
		return new MathQuillFormula({
			anchor: this.getStartPoint()
		})
	}
}