
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox'
import { numberArraySum } from 'core/functions/numberArray'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class AverageBox extends NumberValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'mean',
			argument: [],
			outputProperties: [
				{ name: 'value', displayName: 'mean', type: 'number' }
			]
		}
	}

	result(): number {
		return numberArraySum(this.argument) / this.argument.length
	}

}

export class AverageBoxCreator extends DraggingCreator {
	defaults(): object {
		return {
			helpText: 'Average of a list of numbers.',
			pointOffset: [-40, -40]
		}
	}
	declare creation: AverageBox
	createMobject(): AverageBox {
		return new AverageBox()
	}
}
