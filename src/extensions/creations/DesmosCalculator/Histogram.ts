
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { RadioButtonList } from 'core/mobjects/RadioButtonList'
import { TextLabel } from 'core/mobjects/TextLabel'

export class Histogram extends DesmosCalculator {

	data: Array<number>
	nbBins: number
	binWidth: number
	min: number
	max: number
	leftColor: Color
	rightColor: Color
	scale: number
	scalingSelector: RadioButtonList
	frequencyLabel: TextLabel

	defaults(): object {
		return {
			nbBins: 10,
			min: 0,
			max: 10,
			binWidth: 1,
			data: [],
			scale: 1,
			leftColor: Color.blue(),
			rightColor: Color.red(),
			inputProperties: [
				{ name: 'data', displayName: null, type: 'Array<number>' },
				{ name: 'nbBins', displayName: '# bins', type: 'number' },
				{ name: 'min', displayName: 'minimum', type: 'number' },
				{ name: 'max', displayName: 'maximum', type: 'number' },
				{ name: 'leftColor', displayName: 'left color', type: 'Color' },
				{ name: 'rightColor', displayName: 'right color', type: 'Color' }
			],
			outputProperties: [
				{ name: 'bins', type: 'Array<number>' }
			],
			scalingSelector: new RadioButtonList({
				options: ['absolute', 'relative'],
				orientation: 'horizontal',
				optionSpacing: 100
			}),
			frequencyLabel: new TextLabel({
				text: 'frequency'
			})
		}
	}

	setup() {
		super.setup()
		this.binWidth = (this.max - this.min) / this.nbBins
		this.scalingSelector.update({
			action: this.setScaling.bind(this),
			anchor: [0, this.frameHeight + 10]
		})
		this.scalingSelector.radioButtons[0].select()
		this.add(this.scalingSelector)
		this.controls.push(this.scalingSelector)
		this.frequencyLabel.update({
			anchor: [200, this.frameHeight + 10],
			frameHeight: 18
		})
		this.add(this.frequencyLabel)
		this.controls.push(this.frequencyLabel)
	}

	setScaling(option: string) {
		switch (option) {
			case 'absolute':
				this.scale = 1
				break
			case 'relative':
				this.scale = this.data.length
				break
			default:
				break
		}
	}

	createCalculator(options: object = {}) {
		options['expressions'] = false
		super.createCalculator(options)
		this.calculator.setExpression({ id:'B', latex: `B=[${this.bins()}]/${this.scale}` })
		this.calculator.setMathBounds({
			left: this.min - 0.1 * (this.max - this.min),
			right: this.max + 0.1 * (this.max - this.min),
			bottom:  -1,
			top: 10
		})
	}

	customizeLayout() {
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
			let i = Math.floor((n - this.min) / this.binWidth)
			if (i < this.nbBins) {
				bins[i]++
			}
		}
		return bins
	}

	createBars() {
		for (var i = 0; i < this.nbBins; i++) {
			let color = this.leftColor.interpolate(this.rightColor, i / this.nbBins)
			let x1 = this.min + i * this.binWidth
			let x2 = x1 + this.binWidth
			let latex = `0\\leq y\\leq \\{ ${x1}\\leq x < ${x2}: B[${i + 1}]\\}`
			this.calculator.setExpression({
				id: `bar-${i}`,
				latex: latex,
				color: color.toHex()
			})
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['min'] !== undefined || args['max'] !== undefined || args['nbBins'] !== undefined) {
			this.binWidth = (this.max - this.min) / this.nbBins
		}
		if (args['data'] !== undefined) {
			this.calculator.setExpression({ id:'B', latex: `B=[${this.bins()}]/${this.scale}` })
			this.createBars()
		}
	}

}