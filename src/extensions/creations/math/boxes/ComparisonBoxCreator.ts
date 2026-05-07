
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { ComparisonBox, LessThanBox, LessThanOrEqualBox, GreaterThanBox, GreaterThanOrEqualBox, EqualsBox, NotEqualsBox } from './ComparisonBox'

export class ComparisonBoxCreator extends DraggingCreator {
	declare creation: ComparisonBox
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

	createMobject(): ComparisonBox {
		return new ComparisonBox()
	}
}

export class LessThanBoxCreator extends ComparisonBoxCreator {
	defaults(): object {
		return {
			helpText: 'Compares two input numbers a and b: output is 1 if a < b, otherwise 0. '
		}
	}
	declare creation: LessThanBox
	createMobject(): LessThanBox {
		return new LessThanBox()
	}
}

export class LessThanOrEqualBoxCreator extends ComparisonBoxCreator {
	defaults(): object {
		return {
			helpText: 'Compares two input numbers a and b: output is 1 if a &le; b, otherwise 0. '
		}
	}
	declare creation: LessThanOrEqualBox
	createMobject(): LessThanOrEqualBox {
		return new LessThanOrEqualBox()
	}
}

export class GreaterThanBoxCreator extends ComparisonBoxCreator {
	defaults(): object {
		return {
			helpText: 'Compares two input numbers a and b: output is 1 if a > b, otherwise 0. '
		}
	}
	declare creation: GreaterThanBox
	createMobject(): GreaterThanBox {
		return new GreaterThanBox()
	}
}

export class GreaterThanOrEqualBoxCreator extends ComparisonBoxCreator {
	defaults(): object {
		return {
			helpText: 'Compares two input numbers a and b: output is 1 if a &ge; b, otherwise 0. '
		}
	}
	declare creation: GreaterThanOrEqualBox
	createMobject(): GreaterThanOrEqualBox {
		return new GreaterThanOrEqualBox()
	}
}

export class EqualsBoxCreator extends ComparisonBoxCreator {
	defaults(): object {
		return {
			helpText: 'Compares two input numbers a and b: output is 1 if a = b, otherwise 0. '
		}
	}
	declare creation: EqualsBox
	createMobject(): EqualsBox {
		return new EqualsBox()
	}
}

export class NotEqualsBoxCreator extends ComparisonBoxCreator {
	defaults(): object {
		return {
			helpText: 'Compares two input numbers a and b: output is 1 if a &ne; b, otherwise 0. '
		}
	}
	declare creation: NotEqualsBox
	createMobject(): NotEqualsBox {
		return new NotEqualsBox()
	}
}





