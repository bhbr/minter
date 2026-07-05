
import { VisualOperator } from './VisualOperator'

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