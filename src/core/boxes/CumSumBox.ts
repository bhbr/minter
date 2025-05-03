
import { NumberListValuedFunctionBox } from './NumberListValuedFunctionBox'
import { numberArrayCumSum } from 'core/functions/numberArray'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class CumSumBox extends NumberListValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'cumsum',
			argument: [],
			outputProperties: [
				{ name: 'value', type: 'Array<number>' }
			]
		}
	}
	
	result(): Array<number> {
		return numberArrayCumSum(this.argument) 
	}

}

export class CumSumBoxCreator extends DraggingCreator {
	declare creation: CumSumBox
	createMobject(): CumSumBox {
		return new CumSumBox()
	}
}
