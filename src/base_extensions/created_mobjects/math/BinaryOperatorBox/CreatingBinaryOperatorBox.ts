import { CreatingFixedMobject } from 'core/mobject/creating/CreatingFixedMobject'
import { BinaryOperatorBox, AddBox, SubtractBox, MultiplyBox, DivideBox } from './BinaryOperatorBox'

export class CreatingBinaryOperatorBox extends CreatingFixedMobject {
	declare creation: BinaryOperatorBox

	statefulSetup() {
		super.statefulSetup()
		this.creation.operatorLabel.update({
			text: this.creation.operatorDict[this.creation.operator]
		})
	}

	createMobject(): BinaryOperatorBox {
		return new BinaryOperatorBox()
	}
}

export class CreatingAddBox extends CreatingBinaryOperatorBox {
	declare creation: AddBox
	createMobject(): AddBox {
		return new AddBox()
	}
}

export class CreatingSubtractBox extends CreatingBinaryOperatorBox {
	declare creation: SubtractBox
	createMobject(): SubtractBox {
		return new SubtractBox()
	}
}

export class CreatingMultiplyBox extends CreatingBinaryOperatorBox {
	declare creation: MultiplyBox
	createMobject(): MultiplyBox {
		return new MultiplyBox()
	}
}

export class CreatingDivideBox extends CreatingBinaryOperatorBox {
	declare creation: DivideBox
	createMobject(): DivideBox {
		return new DivideBox()
	}
}