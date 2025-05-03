
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class SequencePlot extends DesmosCalculator {

	data: Array<number>

	defaults(): object {
		return {
			inputProperties: [
			{ name: 'data', type: 'Array<number>' }
		],
			valueList: [0]
		}
	}

	createCalculator(options: object = {}) {
		options['expressions'] = true
		super.createCalculator(options)
		this.calculator.setExpression({ id: 'data', latex: `D = [0]` })
		this.calculator.setExpression({ id: 'index', latex: `k = [1]` })
		this.calculator.setExpression({ id: 'lines', latex: `\\{k<x<k+1:(1-x+k) D[k]+(x-k) D[k+1]\\}`})
		this.calculator.setExpression({ id: 'dots', latex: `(k, D)` })
		this.calculator.setExpression({ id: 'bars', latex: `0\\leq y\\leq \\{ k-1\\leq x < k: D[k]\\}` })
		this.calculator.setMathBounds({
			left: -0.5,
			right: 10,
			bottom: -0.1,
			top: 1.1
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['data'] !== undefined) {
			this.calculator.setExpression({ id:'data', latex: `D=[${this.data}]` })
			this.calculator.setExpression({ id: 'index', latex: `k = [1, ..., ${this.data.length}]` })
		}

	}

}