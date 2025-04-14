
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class RunningAveragePlotter extends DesmosCalculator {

	valueList: Array<number>

	defaults(): object {
		return {
			inputNames: ['valueList'],
			valueList: [0]
		}
	}

	createCalculator(options: object = {}) {
		options['expressions'] = false
		super.createCalculator(options)
		this.calculator.setExpression({ id: 'L', latex: `L = [${this.valueList}]` })
		this.calculator.setExpression({ id: 'k', latex: `k = [1, ..., ${this.valueList.length}]` })
		this.calculator.setExpression({ id: 'a', latex: `a = \\frac 1 k \\sum_{n=1}^k L[n]` })
		this.calculator.setExpression({ id: 'a-vs-k-lines', latex: `\\{k<x<k+1:(1-x+k) a[k]+(x-k) a[k+1]\\}`})
		this.calculator.setExpression({ id: 'a-vs-k', latex: `(k, a)` })
		this.calculator.setMathBounds({
			left: -0.5,
			right: 10,
			bottom: -0.1,
			top: 1.1
		})
	}

	createLine() {

	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['valueList'] !== undefined) {
			this.calculator.setExpression({ id:'L', latex: `L=[${this.valueList}]` })
			this.calculator.setExpression({ id: 'k', latex: `k = [1, ..., ${this.valueList.length}]` })
			this.createLine()
		}

	}

}