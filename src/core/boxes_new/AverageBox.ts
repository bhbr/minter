
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox'
import { numberArraySum } from 'core/functions/numberArray'

export class AverageBox extends NumberValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'avg',
			argument: [],
			inputProperties: [
				{ name: 'argument', type: 'Array<number>' }
			]
		}
	}
	result(): number {
		return numberArraySum(this.argument) / this.argument.length
	}

}