
import { BinaryOperatorBox } from './BinaryOperatorBox'

export class ComparisonBox extends BinaryOperatorBox {
	defaults(): object {
		return {
			operator: '=',
 			inputProperties: [
				{ name: 'operand1', displayName: 'left side', type: 'number|Array<number>' },
				{ name: 'operand2', displayName: 'right side', type: 'number|Array<number>' }
			],
			outputProperties: [
				{ name: 'result', displayName: 'result', type: 'number|Array<number>' }
			]
		}
	}
	mutabilities(): object {
		return {
			operator: 'in_subclass'
		}
	}
}

export class LessThanBox extends ComparisonBox {

	defaults(): object {
		return {
			operator: '<'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

}

export class LessThanOrEqualBox extends ComparisonBox {

	defaults(): object {
		return {
			operator: '≤'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

}

export class GreaterThanBox extends ComparisonBox {

	defaults(): object {
		return {
			operator: '>'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

}

export class GreaterThanOrEqualBox extends ComparisonBox {

	defaults(): object {
		return {
			operator: '≥'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

}

export class EqualsBox extends ComparisonBox {

	defaults(): object {
		return {
			operator: '='
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

}

export class NotEqualsBox extends ComparisonBox {

	defaults(): object {
		return {
			operator: '≠'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

}
