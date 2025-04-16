
import { FunctionBox } from './FunctionBox'
import { numberArraySum, numberArrayAverage, numberArrayCumSum, numberArrayCumAverage } from 'core/functions/numberArray'


export class SumBox extends FunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			functionName: 'sum'
		}
	}

	mutabilities(): object {
		return {
			functionName: 'never'
		}
	}

	result(): number {
		return numberArraySum(this.argument)
	}
}

export class AverageBox extends FunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			functionName: 'avg'
		}
	}

	mutabilities(): object {
		return {
			functionName: 'never'
		}
	}

	result(): number {
		return numberArrayAverage(this.argument)
	}
}

export class CumSumBox extends FunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			functionName: 'cumsum'
		}
	}

	mutabilities(): object {
		return {
			functionName: 'never'
		}
	}

	result(): Array<number> {
		return numberArrayCumSum(this.argument)
	}
}

export class CumAverageBox extends FunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			functionName: 'cumavg'
		}
	}

	mutabilities(): object {
		return {
			functionName: 'never'
		}
	}

	result(): Array<number> {
		return numberArrayCumAverage(this.argument)
	}
}



