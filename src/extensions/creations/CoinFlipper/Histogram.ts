
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class Histogram extends DesmosCalculator {

	tailsList: Array<number>
	nbCoins: number
	barsCreates: boolean

	defaults(): object {
		return {
			tailsList: [],
			inputNames: ['tailsList', 'nbCoins']
		}
	}

	createCalculator(options: object = {}) {
		options['expressions'] = false
		super.createCalculator(options)
		this.createTailsList()
		this.createNormalDistribution()
		this.calculator.setExpression({ id:'L', latex: `L=[${this.tailsList}]` })
		this.calculator.setMathBounds({
			left: -1,
			right: this.nbCoins + 1,
			bottom:  - 2 / this.nbCoins ** 0.5 * 0.1,
			top: 2 / this.nbCoins ** 0.5 * 1.1
		})
	}

	nbFlips() {
		var sum = 0
		for (var i = 0; i < this.tailsList.length; i++) {
			sum += this.tailsList[i]
		}
		return sum
	}

	createTailsList() {
		this.tailsList = []
		for (var i = 0; i <= this.nbCoins; i++) {
			this.tailsList.push(0)
		}
	}

	createBinomialDistribution() {
		for (var i = 0; i <= this.nbCoins; i++) {
			let latex = `y = \\{ ${i}\\leq x < ${i + 1}:  \\nCr(${this.nbCoins}, ${i}) / (2^${this.nbCoins})\\}`
			this.calculator.setExpression({
				id: `dist-${i}`,
				latex: latex,
				color: Color.black().toHex()
			})
		}
	}

	createNormalDistribution() {
		let mean = this.nbCoins / 2
		let variance = 0.25 * this.nbCoins
		let latex = `y=\\frac{1}{(2\\pi ${variance})^{0.5}}\\exp(-\\frac{(x-${mean})^2}{2 * ${variance}})`
		this.calculator.setExpression({
				id: `dist-normal`,
				latex: latex,
				color: Color.black().toHex()
			})
	}

	createBars() {
		for (var i = 0; i <= this.nbCoins; i++) {
			let color = Color.red().interpolate(Color.blue(), i / this.nbCoins)
			let latex = `0\\leq y\\leq \\{ ${i}\\leq x < ${i + 1}: L[${i + 1}] / ${this.nbFlips()}\\}`
			this.calculator.setExpression({
				id: `bar-${i}`,
				latex: latex,
				color: color.toHex()
			})
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['tailsList'] !== undefined) {
			this.calculator.setExpression({ id:'L', latex: `L=[${this.tailsList}]` })
			this.createBars()
		}

	}

}