
import { NumberListValuedFunctionBox } from './NumberListValuedFunctionBox'
import { numberArrayCumAverage } from 'core/functions/numberArray'

export class CumAverageBox extends NumberListValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'cumavg',
			argument: [],
			outputProperties: [
				{ name: 'value', type: 'Array<number>' }
			]
		}
	}
	
	result(): Array<number> {
		return numberArrayCumAverage(this.argument) 
	}

}