
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox.js'
import { numberArraySum } from 'functions/numberArray.js'
import { DraggingCreator } from 'creators/DraggingCreator.js'

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
	defaults(): object {
		return {
			helpText: 'Sum of a list of numbers.',
			pointOffset: [-40, -40]
		}
	}	declare creation: SumBox
	createMobject(): SumBox {
		return new SumBox()
	}
}