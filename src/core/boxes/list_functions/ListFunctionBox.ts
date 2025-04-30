
import { FunctionBox } from '../FunctionBox'
import { NumberBox } from '../NumberBox/NumberBox'
import { NumberListBox } from '../lists/NumberListBox'
import { numberArraySum, numberArrayAverage, numberArrayCumSum, numberArrayCumAverage } from 'core/functions/numberArray'

export class ListFunctionBox extends FunctionBox {

	declare argument: Array<number>

	defaults(): object {
		return {
			argument: [],
			inputProperties: [
				{ name: 'argument', type: 'Array<number>' }
			]
		}
	}
}

export class SumBox extends ListFunctionBox {

	declare valueBox: NumberBox
	
	defaults(): object {
		return {
			functionName: 'sum',
			valueBox: new NumberBox(),
			outputProperties: [
				{ name: 'value', type: 'number' }
			]
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

export class AverageBox extends ListFunctionBox {

	declare valueBox: NumberBox

	defaults(): object {
		return {
			functionName: 'avg',
			valueBox: new NumberBox(),
			outputProperties: [
				{ name: 'value', type: 'number' }
			]
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

export class CumSumBox extends ListFunctionBox {

	declare valueBox: NumberListBox

	defaults(): object {
		return {
			functionName: 'cumsum',
			valueBox: new NumberListBox(),
			outputProperties: [
				{ name: 'value', type: 'Array<number>' }
			]
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

export class CumAverageBox extends ListFunctionBox {

	declare valueBox: NumberListBox

	defaults(): object {
		return {
			functionName: 'cumavg',
			valueBox: new NumberListBox(),
			outputProperties: [
				{ name: 'value', type: 'Array<number>' }
			]
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



