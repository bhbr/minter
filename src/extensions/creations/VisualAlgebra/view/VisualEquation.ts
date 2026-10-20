
import { VisualOperator } from './VisualOperator.js'

export class VisualEquation extends VisualOperator {

	defaults(): object {
		return {
			operator: '='
		}
	}

	getValue(): number {
		return NaN
	}
	
}