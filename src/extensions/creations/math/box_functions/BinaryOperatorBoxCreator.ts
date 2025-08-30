
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { BinaryOperatorBox, AddBox, SubtractBox, MultiplyBox, DivideBox } from './BinaryOperatorBox'
import { LessThanBox } from './ComparisonBox'

export class BinaryOperatorBoxCreator extends DraggingCreator {
	declare creation: BinaryOperatorBox

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
	createMobject(): AddBox {
		return new AddBox()
	}
}

export class SubtractBoxCreator extends BinaryOperatorBoxCreator {
	declare creation: SubtractBox
	createMobject(): SubtractBox {
		return new SubtractBox()
	}
}

export class MultiplyBoxCreator extends BinaryOperatorBoxCreator {
	declare creation: MultiplyBox
	createMobject(): MultiplyBox {
		return new MultiplyBox()
	}
}

export class DivideBoxCreator extends BinaryOperatorBoxCreator {
	declare creation: DivideBox
	createMobject(): DivideBox {
		return new DivideBox()
	}
}
