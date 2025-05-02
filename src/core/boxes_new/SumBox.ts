
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox'
import { numberArraySum } from 'core/functions/numberArray'

export class SumBox extends NumberValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'sum',
			argument: [],
			inputProperties: [
				{ name: 'argument', type: 'Array<number>' }
			]
		}
	}

	result(): number {
		return numberArraySum(this.argument) 
	}

}