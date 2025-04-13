
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'

export class Histogram extends DesmosCalculator {

	tailsList: Array<number>

	defaults(): object {
		return {
			tailsList: [],
			inputNames: ['tailsList']
		}
	}

	createCalculator() {
		super.createCalculator()
		this.calculator.setExpression({ id:'L', latex: `L=[${this.tailsList}]` })
		this.calculator.setExpression({ id: 'hist', latex: `\\histogram(L)` })
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['tailsList'] !== undefined) {
			this.calculator.setExpression({ id:'L', latex: `L=[${this.tailsList}]` })
		}
	}

}