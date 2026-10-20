
import { DraggingCreator } from 'creators/DraggingCreator.js'
import { BinaryOperatorBox, AddBox, SubtractBox, MultiplyBox, DivideBox } from './BinaryOperatorBox.js'
import { LessThanBox } from './ComparisonBox.js'

export class BinaryOperatorBoxCreator extends DraggingCreator {
	declare creation: BinaryOperatorBox

	defaults(): object {
		return {
			pointOffset: [-40, -40]
		}
	}

	setup() {
		super.setup()
		this.creation.operatorLabel.update({
			text: this.creation.operatorLabelText()
		})
	}

	createMobject(): BinaryOperatorBox {
		return new BinaryOperatorBox()
	}
}

export class AddBoxCreator extends BinaryOperatorBoxCreator {
	declare creation: AddBox
	defaults(): object {
		return {
			helpText: 'Adds two input numbers.'
		}
	}
	createMobject(): AddBox {
		return new AddBox()
	}
}

export class SubtractBoxCreator extends BinaryOperatorBoxCreator {
	declare creation: SubtractBox
	defaults(): object {
		return {
			helpText: 'Subtracts two input numbers.'
		}
	}
	createMobject(): SubtractBox {
		return new SubtractBox()
	}
}

export class MultiplyBoxCreator extends BinaryOperatorBoxCreator {
	declare creation: MultiplyBox
	defaults(): object {
		return {
			helpText: 'Multiplies two input numbers.'
		}
	}
	createMobject(): MultiplyBox {
		return new MultiplyBox()
	}
}

export class DivideBoxCreator extends BinaryOperatorBoxCreator {
	defaults(): object {
		return {
			helpText: 'Divides two input numbers.'
		}
	}	declare creation: DivideBox
	createMobject(): DivideBox {
		return new DivideBox()
	}
}
