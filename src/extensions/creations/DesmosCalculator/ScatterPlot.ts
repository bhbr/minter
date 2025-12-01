
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { Checkbox } from 'core/mobjects/Checkbox'

export class ScatterPlot extends DesmosCalculator {

	xData?: Array<number>
	yData: Array<number>
	showPointsCheckbox: Checkbox
	showLinesCheckbox: Checkbox

	defaults(): object {
		return {
			inputProperties: [
				{ name: 'xData', displayName: 'x data', type: 'Array<number>' },
				{ name: 'yData', displayName: 'y data', type: 'Array<number>' }
			],
			xData: [],
			yData: [0],
			showPointsCheckbox: new Checkbox({
				text: 'points',
				state: true
			}),
			showLinesCheckbox: new Checkbox({
				text: 'lines',
				state: false
			})
		}
	}

	setXArrayExpression(listString: string) {
		this.calculator.setExpression({ id: 'xData', latex: `X = [${listString}]` })
	}

	setYArrayExpression(listString: string) {
		this.calculator.setExpression({ id: 'yData', latex: `Y = [${listString}]` })
	}

	setXDataExpression() {
		if (this.xData.length > 1) {
			this.setXArrayExpression(`${this.xData}`)
		} else {
			this.setXArrayExpression(`1, ..., ${this.yData.length}`)
		}
	}

	setYDataExpression() {
		this.setYArrayExpression(`${this.yData}`)
	}

	setDataExpressions() {
		this.setXDataExpression()
		this.setYDataExpression()
	}

	createCalculator(options: object = {}) {
		options['expressions'] = false
		super.createCalculator(options)
		this.setDataExpressions()
		//this.calculator.setExpression({ id: 'lines', latex: `\\{k<x<k+1:(1-x+k) D[k]+(x-k) D[k+1]\\}`})
		this.calculator.setExpression({ id: 'dots', latex: `(X, Y)` })
		//this.calculator.setExpression({ id: 'bars', latex: `0\\leq y\\leq \\{ k-1\\leq x < k: D[k]\\}` })
		this.calculator.setMathBounds({
			left: -0.5,
			right: 10,
			bottom: -0.1,
			top: 1.1
		})
		this.showPointsCheckbox.update({
			anchor: [this.frameWidth / 2 - 100, this.frameHeight + 10]
		})
		this.showPointsCheckbox.onToggle = this.setPointsVisibility.bind(this)
		this.add(this.showPointsCheckbox)
		this.setPointsVisibility(true)

		this.showLinesCheckbox.update({
			anchor: [this.frameWidth / 2 + 10, this.frameHeight + 10]
		})
		this.showLinesCheckbox.onToggle = this.setLinesVisibility.bind(this)
		this.add(this.showLinesCheckbox)
		this.setLinesVisibility(false)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['xData'] !== undefined || args['yData'] !== undefined) {
			this.setDataExpressions()
		}
	}

	setPointsVisibility(visible: boolean) {
		this.calculator.setExpression({
			id: 'dots',
			points: visible
		})
	}

	setLinesVisibility(visible: boolean) {
		this.calculator.setExpression({
			id: 'dots',
			lines: visible
		})
	}

}