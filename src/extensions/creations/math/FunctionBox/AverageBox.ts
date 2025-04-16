
import { FunctionBox } from './FunctionBox'
import { numberArrayAverage } from 'core/functions/numberArray'

export class AverageBox extends FunctionBox {
	
	declare argument: Array<number>

	result(): number {
		return numberArrayAverage(this.argument)
	}
}