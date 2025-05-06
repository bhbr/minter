
import { NumberValuedFunctionBox } from './NumberValuedFunctionBox'
import { numberArraySum } from 'core/functions/numberArray'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class AverageBox extends NumberValuedFunctionBox {
	
	declare argument: Array<number>

	defaults(): object {
		return {
			name: 'mean',
			argument: [],
			inputProperties: [
				{ name: 'argument', displayName: 'list', type: 'Array<number>' }
			]
		}
	}
	result(): number {
		return numberArraySum(this.argument) / this.argument.length
	}

}

export class AverageBoxCreator extends DraggingCreator {
	declare creation: AverageBox
	createMobject(): AverageBox {
		return new AverageBox()
	}
}
