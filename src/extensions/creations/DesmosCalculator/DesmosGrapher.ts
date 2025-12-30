
import { DesmosCalculator } from './DesmosCalculator'

export class DesmosGrapher extends DesmosCalculator {

	xExpression: string | null
	yExpression: string | null
	variable: string

	defaults(): object {
		return {
			xExpression: null,
			yExpression: null,
			variable: 'x'
		}
	}

	

}