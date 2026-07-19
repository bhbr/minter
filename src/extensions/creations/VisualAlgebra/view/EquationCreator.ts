
import { VisualCalculation } from './VisualCalculation'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class EquationCreator extends DraggingCreator {

	declare creation: VisualCalculation

	defaults(): object {
		return {
			helpText: 'An algebraic equation. Tap on subexpressions to see suggested solution steps.',
			pointOffset: [-20, -50]
		}
	}

	createMobject(): VisualCalculation {
		return new VisualCalculation({
			anchor: this.getStartPoint()
		})
	}

	dissolve() {
		super.dissolve()
		this.creation.focus()
	}
}