
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox'
import { numberArraySum } from 'core/functions/numberArray'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class SumBox extends NumberValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'sum',
			argument: [],
			outputProperties: [
				{ name: 'value', displayName: 'sum', type: 'number' }
			]
		}
	}

	result(): number {
		return numberArraySum(this.argument) 
	}

}


export class SumBoxCreator extends DraggingCreator {
	declare creation: SumBox
	createMobject(): SumBox {
		return new SumBox()
	}
}