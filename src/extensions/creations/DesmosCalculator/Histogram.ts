
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'

export class Histogram extends DesmosCalculator {

	data: Array<number>
	nbBins: number
	leftColor: Color
	rightColor: Color

	defaults(): object {
		return {
			nbBins: 0,
			data: [],
			leftColor: Color.green(),
			rightColor: Color.purple(),
			inputNames: ['data', 'nbBins', 'leftColor', 'rightColor'],
			outputNames: ['bins']
		}
	}

	createCalculator(options: object = {}) {
		options['expressions'] = false
		super.createCalculator(options)
		this.calculator.setExpression({ id:'B', latex: `B=[${this.bins()}]` })
		this.calculator.setMathBounds({
			left: -1,
			right: this.nbBins + 1,
			bottom:  - 1,
			top: 10
		})
	}

	sampleSize() {
		return this.data.length
	}

	bins() {
		let bins = []
		for (var i = 0; i < this.nbBins; i++) {
			bins.push(0)
		}
		for (var n of this.data) {
			bins[n]++
		}
		return bins
	}

	createBars() {
		for (var i = 0; i < this.nbBins; i++) {
			let color = this.leftColor.interpolate(this.rightColor, i / this.nbBins)
			let latex = `0\\leq y\\leq \\{ ${i}\\leq x < ${i + 1}: B[${i + 1}]\\}`
			this.calculator.setExpression({
				id: `bar-${i}`,
				latex: latex,
				color: color.toHex()
			})
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['data'] !== undefined) {
			this.calculator.setExpression({ id:'B', latex: `B=[${this.bins()}]` })
			this.createBars()
		}

	}

}