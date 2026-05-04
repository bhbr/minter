
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { RadioButtonList } from 'core/ui/RadioButtonList'
import { TextLabel } from 'core/ui/TextLabel'
import { Checkbox } from 'core/ui/Checkbox'

export class Histogram extends DesmosCalculator {

	data: Array<number>
	nbBins: number
	binWidth: number
	min: number
	max: number
	leftColor: Color
	rightColor: Color
	scalingSelector: RadioButtonList
	scaling: 'absolute' | 'relative'
	scale: number
	autoadjustScale: boolean
	autoadjustScaleCheckBox: Checkbox

	defaults(): object {
		return {
			nbBins: 10,
			min: 0,
			max: 10,
			binWidth: 1,
			data: [],
			leftColor: Color.blue(),
			rightColor: Color.red(),
			inputProperties: [
				{ name: 'data', displayName: null, type: 'Array<number>' },
				{ name: 'nbBins', displayName: '# bins', type: 'number' },
				{ name: 'min', displayName: 'minimum', type: 'number' },
				{ name: 'max', displayName: 'maximum', type: 'number' },
				//{ name: 'leftColor', displayName: 'left color', type: 'Color' },
				//{ name: 'rightColor', displayName: 'right color', type: 'Color' }
			],
			outputProperties: [
				{ name: 'bins', type: 'Array<number>' }
			],
			scalingSelector: new RadioButtonList({
				options: ['absolute frequency', 'relative frequency'],
				orientation: 'horizontal',
				optionSpacing: 200
			}),
			scale: 1,
			scaling: 'absolute',
			options: {
				expressions: false
			},
			autoadjustScale: false,
			autoadjustScaleCheckBox: new Checkbox({
				text: 'auto-adjust scale',
				state: false
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
		this.scalingSelector.radioButtons[0].label.update({
			frameWidth: 180
		})
		this.scalingSelector.radioButtons[1].label.update({
			frameWidth: 180
		})
		this.scalingSelector.radioButtons[0].select()
		this.controls.add(this.scalingSelector)
		this.autoadjustScaleCheckBox.update({
			anchor: [0, this.frameHeight + 40]
		})
		this.autoadjustScaleCheckBox.label.update({
			frameWidth: 180
		})
		this.controls.add(this.autoadjustScaleCheckBox)
		this.autoadjustScaleCheckBox.onToggle = this.toggleYScale.bind(this)
	}

	setScaling(redraw: boolean = true) {
		if (this.scalingSelector.selectedButton == this.scalingSelector.radioButtons[1]) {
			this.scale = this.data.length
		} else {
			this.scale = 1
		}
		if (redraw) {
			this.calculator.setExpression({ id:'B', latex: `B=[${this.bins()}]/${this.scale}` })
			this.createBars()
		}
	}

	createCalculator() {
		super.createCalculator()
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
			if (i >= 0 && i < this.nbBins) {
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

	toggleYScale() {
		this.autoadjustScale = !this.autoadjustScale
	}

	setYMax(unpaddedYMax: number) {
		let xMin = this.calculator.graphpaperBounds.mathCoordinates.left
		let xMax = this.calculator.graphpaperBounds.mathCoordinates.right
		let yMin = -0.1 * unpaddedYMax
		let yMax = 1.1 * unpaddedYMax
		this.calculator.setMathBounds({
			left: xMin,
			right: xMax,
			top: yMax,
			bottom: yMin
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['min'] !== undefined || args['max'] !== undefined || args['nbBins'] !== undefined) {
			this.binWidth = (this.max - this.min) / this.nbBins
		}
		if (args['data'] !== undefined) {
			this.setScaling(false)
			this.calculator.setExpression({ id:'B', latex: `B=[${this.bins()}]/${this.scale}` })
			this.createBars()
			if (this.autoadjustScale) {
				let yMax = Math.max(...this.bins())
				this.setYMax(yMax)
			}
		}
		if (args['min'] !== undefined || args['max'] !== undefined) {
			let newXMin = args['min'] ?? this.min
			let newXMax = args['max'] ?? this.max
			let yMin = this.calculator.graphpaperBounds.mathCoordinates.bottom
			let yMax = this.calculator.graphpaperBounds.mathCoordinates.top
			this.calculator.setMathBounds({
				left: newXMin - 0.1 * (this.max - newXMin),
				right: newXMax + 0.1 * (newXMax - this.min),
				top: yMax,
				bottom: yMin
			})
		}
	}

}