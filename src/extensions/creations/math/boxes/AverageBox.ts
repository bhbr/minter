
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox'
import { numberArraySum } from 'core/functions/numberArray'
import { DraggingCreator } from 'core/creators/DraggingCreator'
import { log } from 'core/functions/logging'

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
		if (this.argument.length > 0) {
			return numberArraySum(this.argument) / this.argument.length
		} else {
			return 0
		}
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
