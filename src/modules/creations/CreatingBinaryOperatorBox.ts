import { CreatingFixedMobject } from './CreatingFixedMobject'
import { BinaryOperatorBox, AddBox, SubtractBox, MultiplyBox, DivideBox } from '../arithmetic/BinaryOperatorBox'
import { log } from '../helpers/helpers'

export class CreatingBinaryOperatorBox extends CreatingFixedMobject {
	declare creation: BinaryOperatorBox

	statefulSetup() {
		super.statefulSetup()
		this.creation.operatorLabel.update({
			text: this.creation.operatorDict[this.creation.operator]
		})
	}

	createdMobject(): BinaryOperatorBox {
		return new BinaryOperatorBox()
	}
}

export class CreatingAddBox extends CreatingBinaryOperatorBox {
	declare creation: AddBox
	createdMobject(): AddBox {
		return new AddBox()
	}
}

export class CreatingSubtractBox extends CreatingBinaryOperatorBox {
	declare creation: SubtractBox
	createdMobject(): SubtractBox {
		return new SubtractBox()
	}
}

export class CreatingMultiplyBox extends CreatingBinaryOperatorBox {
	declare creation: MultiplyBox
	createdMobject(): MultiplyBox {
		return new MultiplyBox()
	}
}

export class CreatingDivideBox extends CreatingBinaryOperatorBox {
	declare creation: DivideBox
	createdMobject(): DivideBox {
		return new DivideBox()
	}
}