import { DraggingCreator } from 'core/creators/DraggingCreator'
import { SumBox, AverageBox, CumSumBox, CumAverageBox } from './ListOperationBoxes'

export class SumBoxCreator extends DraggingCreator {
	declare creation: SumBox
	createMobject(): SumBox {
		return new SumBox()
	}
}

export class AverageBoxCreator extends DraggingCreator {
	declare creation: AverageBox
	createMobject(): AverageBox {
		return new AverageBox()
	}
}

export class CumSumBoxCreator extends DraggingCreator {
	declare creation: CumSumBox
	createMobject(): CumSumBox {
		return new CumSumBox()
	}
}

export class CumAverageBoxCreator extends DraggingCreator {
	declare creation: CumAverageBox
	createMobject(): CumAverageBox {
		return new CumAverageBox()
	}
}