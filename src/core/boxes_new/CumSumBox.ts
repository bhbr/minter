
import { NumberListValuedFunctionBox } from './NumberListValuedFunctionBox'
import { numberArrayCumSum } from 'core/functions/numberArray'

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