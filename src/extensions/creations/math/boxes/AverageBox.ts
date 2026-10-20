
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox.js'
import { numberArraySum } from 'functions/numberArray.js'
import { DraggingCreator } from 'creators/DraggingCreator.js'
import { log } from 'functions/logging.js'

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
			return NaN
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
