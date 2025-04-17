import { DraggingCreator } from 'core/creators/DraggingCreator'
import { ListFunctionBox, SumBox, AverageBox, CumSumBox, CumAverageBox } from './ListFunctionBox'

export class ListFunctionBoxCreator extends DraggingCreator {
	declare creation: ListFunctionBox
	createMobject(): ListFunctionBox {
		return new ListFunctionBox()
	}
}

export class SumBoxCreator extends ListFunctionBoxCreator {
	declare creation: SumBox
	createMobject(): SumBox {
		return new SumBox()
	}
}

export class AverageBoxCreator extends ListFunctionBoxCreator {
	declare creation: AverageBox
	createMobject(): AverageBox {
		return new AverageBox()
	}
}

export class CumSumBoxCreator extends ListFunctionBoxCreator {
	declare creation: CumSumBox
	createMobject(): CumSumBox {
		return new CumSumBox()
	}
}

export class CumAverageBoxCreator extends ListFunctionBoxCreator {
	declare creation: CumAverageBox
	createMobject(): CumAverageBox {
		return new CumAverageBox()
	}
}