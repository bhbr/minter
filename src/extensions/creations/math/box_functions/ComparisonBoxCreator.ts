
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { ComparisonBox, LessThanBox, LessThanOrEqualBox, GreaterThanBox, GreaterThanOrEqualBox, EqualsBox, NotEqualsBox } from './ComparisonBox'

export class ComparisonBoxCreator extends DraggingCreator {
	declare creation: ComparisonBox

	setup() {
		super.setup()
		this.creation.operatorLabel.update({
			text: this.creation.operatorLabelText()
		})
	}

	createMobject(): ComparisonBox {
		return new ComparisonBox()
	}
}

export class LessThanBoxCreator extends ComparisonBoxCreator {
	declare creation: LessThanBox
	createMobject(): LessThanBox {
		return new LessThanBox()
	}
}

export class LessThanOrEqualBoxCreator extends ComparisonBoxCreator {
	declare creation: LessThanOrEqualBox
	createMobject(): LessThanOrEqualBox {
		return new LessThanOrEqualBox()
	}
}

export class GreaterThanBoxCreator extends ComparisonBoxCreator {
	declare creation: GreaterThanBox
	createMobject(): GreaterThanBox {
		return new GreaterThanBox()
	}
}

export class GreaterThanOrEqualBoxCreator extends ComparisonBoxCreator {
	declare creation: GreaterThanOrEqualBox
	createMobject(): GreaterThanOrEqualBox {
		return new GreaterThanOrEqualBox()
	}
}

export class EqualsBoxCreator extends ComparisonBoxCreator {
	declare creation: EqualsBox
	createMobject(): EqualsBox {
		return new EqualsBox()
	}
}

export class NotEqualsBoxCreator extends ComparisonBoxCreator {
	declare creation: NotEqualsBox
	createMobject(): NotEqualsBox {
		return new NotEqualsBox()
	}
}





