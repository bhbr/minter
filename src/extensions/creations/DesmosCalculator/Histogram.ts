
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { RadioButtonList } from 'core/ui/RadioButtonList'
import { TextLabel } from 'core/ui/TextLabel'
import { Checkbox } from 'core/ui/Checkbox'
import { NumberInputBox } from 'extensions/ui/InputBox/NumberInputBox'
import { DependencyLink } from 'core/linkables/DependencyLink'

export class Histogram extends DesmosCalculator {

	data: Array<number>
	nbBins: number
	binWidth: number
	bins: Array<number>
	min: number
	max: number
	leftColor: Color
	rightColor: Color
	scalingSelector: RadioButtonList
	scaling: 'absolute' | 'relative'
	scale: number
	autoadjustScale: boolean
	autoadjustScaleCheckBox: Checkbox
	minInputBox: NumberInputBox
	maxInputBox: NumberInputBox
	binWidthInputBox: NumberInputBox
	nbBinsInputBox: NumberInputBox


	defaults(): object {
		return {
			nbBins: 10,
			min: 0,
			max: 10,
			binWidth: 1,
			data: [],
			bins: [],
			leftColor: Color.blue(),
			rightColor: Color.red(),
			inputProperties: [
				{ name: 'data', displayName: null, type: 'Array<number>' },
				{ name: 'min', displayName: 'minimum', type: 'number' },
				{ name: 'max', displayName: 'maximum', type: 'number' },
				{ name: 'binWidth', displayName: 'bin width', type: 'number' },
				{ name: 'nbBins', displayName: '# bins', type: 'number' }
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
			}),
			minInputBox: new NumberInputBox({
				anchor: [10, -60],
				value: 0,
				labelText: 'minimum:'
			}),
			maxInputBox: new NumberInputBox({
				anchor: [12, -30],
				value: 10,
				labelText: 'maximum:',
				labelGap: 8
			}),
			binWidthInputBox: new NumberInputBox({
				anchor: [150, -60],
				value: 1,
				labelText: 'bin width:'
			}),
			nbBinsInputBox: new NumberInputBox({
				anchor: [150, -30],
				value: 1,
				labelText: '# bins:'
			}),
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

		this.controls.add(this.minInputBox)
		this.controls.add(this.maxInputBox)
		this.controls.add(this.binWidthInputBox)
		this.controls.add(this.nbBinsInputBox)

		this.minInputBox.onReturn = function() {
			this.update({
				min: this.minInputBox.value
			})
			this.minInputBox.deactivateKeyboard()
			this.board.removeInputLinkForPropertyAtMobject('min', this)
		}.bind(this)

		this.maxInputBox.onReturn = function() {
			this.update({
				max: this.maxInputBox.value
			})
			this.maxInputBox.deactivateKeyboard()
			this.board.removeInputLinkForPropertyAtMobject('max', this)
		}.bind(this)

		this.binWidthInputBox.onReturn = function() {
			this.update({
				binWidth: this.binWidthInputBox.value
			})
			this.binWidthInputBox.deactivateKeyboard()
			this.board.removeInputLinkForPropertyAtMobject('binWidth', this)
		}.bind(this)

		this.nbBinsInputBox.onReturn = function() {
			this.update({
				nbBins: this.nbBinsInputBox.value
			})
			this.nbBinsInputBox.deactivateKeyboard()
			this.board.removeInputLinkForPropertyAtMobject('nbBins', this)
		}.bind(this)

		this.binWidthInputBox.update({
			anchor: [this.frameWidth - 190, -60],
			labelWidth: 120,
			value: this.binWidth
		})
		this.nbBinsInputBox.update({
			anchor: [this.frameWidth - 190, -30],
			labelWidth: 120,
			value: this.nbBins
		})
	}

	setScaling(redraw: boolean = true) {
		if (this.scalingSelector.selectedButton == this.scalingSelector.radioButtons[1]) {
			this.scale = this.data.length
		} else {
			this.scale = 1
		}
		if (redraw) {
			this.calculator.setExpression({ id:'B', latex: `B=[${this.bins}]/${this.scale}` })
			this.createBars()
		}
	}

	createCalculator() {
		super.createCalculator()
		this.calculator.setExpression({ id:'B', latex: `B=[${this.bins}]/${this.scale}` })
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

	rebin() {
		this.bins = []
		for (var i = 0; i < this.nbBins; i++) {
			this.bins.push(0)
		}
		for (var n of this.data) {
			let i = Math.floor((n - this.min) / this.binWidth)
			if (i >= 0 && i < this.nbBins) {
				this.bins[i]++
			}
		}
	}

	createBars() {
		for (var i = 0; i < this.nbBins; i++) {
			let color = this.leftColor.interpolate(this.rightColor, i / this.nbBins)
			let x1 = this.min + i * this.binWidth
			let x2 = x1 + this.binWidth
			if (this.bins[i] > 0) {
				let latex = `0\\leq y\\leq \\{ ${x1}\\leq x < ${x2}: B[${i + 1}]\\}`
				this.calculator.setExpression({
					id: `bar-${i}`,
					latex: latex,
					color: color.toHex()
				})
			} else {
				this.calculator.removeExpression({
					id: `bar-${i}`
				})
			}
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

	recomputeNbBins() {
		this.nbBins = Math.floor((this.max - this.min) / this.binWidth)
		this.nbBinsInputBox.update({ value: this.nbBins })
	}

	recomputeBinWidth() {
		this.binWidth = (this.max - this.min) / this.nbBins
		this.binWidthInputBox.update({ value: this.binWidth })
	}

	recomputeMin() {
		this.min = this.max - this.nbBins * this.binWidth
		this.minInputBox.update({ value: this.min })
	}
	recomputeMax() {
		this.max = this.min + this.nbBins * this.binWidth
		this.maxInputBox.update({ value: this.max })
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (this.binWidth == 0) {
			this.binWidth = 1
		}

		var newMin = args['min']
		var newMax = args['max']
		var newBinWidth = args['binWidth']
		var newNbBins = args['nbBins']

		let a = (newMin !== undefined)
		let b = (newMax !== undefined)
		let c = (newBinWidth !== undefined)
		let d = (newNbBins !== undefined)


		let shouldRebin = a || b || c || d

		if (a && !b && !c && !d) {
			this.recomputeNbBins()
		} else if (!a && b && !c && !d) {
			this.recomputeNbBins()
		} else if (!a && !b && c && !d) {
			this.recomputeNbBins()
		} else if (!a && !b && !c && d) {
			this.recomputeBinWidth()
		} else if (a && b && !c && !d) {
			this.recomputeNbBins()
		} else if (a && !b && c && !d) {
			this.recomputeNbBins()
		} else if (a && !b && !c && d) {
			this.recomputeBinWidth()
		} else if (!a && b && c && !d) {
			this.recomputeNbBins()
		} else if (!a && b && !c && d) {
			this.recomputeBinWidth()
		} else if (!a && !b && c && d) {
			this.recomputeMax()
		} else if (a && b && c && !d) {
			this.recomputeNbBins()
		} else if (a && b && !c && d) {
			this.recomputeBinWidth()
		} else if (a && !b && c && d) {
			this.recomputeMax()
		} else if (!a && b && c && d) {
			this.recomputeMin()
		} else if (a && b && c && d) {
			throw `Cannot update all four properties of histogram`;
		}

		this.minInputBox.update({ value: this.min })
		this.maxInputBox.update({ value: this.max })
		this.binWidthInputBox.update({ value: this.binWidth })
		this.nbBinsInputBox.update({ value: this.nbBins })

		if (args['data'] !== undefined || shouldRebin) {
			this.setScaling(false)
			this.rebin()
			this.calculator.setExpression({ id:'B', latex: `B=[${this.bins}]/${this.scale}` })
			this.createBars()
			if (this.autoadjustScale) {
				let yMax = Math.max(...this.bins) / this.scale
				this.setYMax(yMax)
			}
		}
		if (args['min'] !== undefined || args['max'] !== undefined) {
			let newXMin = args['min'] ?? this.min
			let newXMax = args['max'] ?? this.max
			let yMin = this.calculator.graphpaperBounds.mathCoordinates.bottom
			let yMax = this.calculator.graphpaperBounds.mathCoordinates.top
			this.calculator.setMathBounds({
				left: this.min - 0.1 * (this.max - this.min),
				right: this.max + 0.1 * (this.max - this.min),
				top: yMax,
				bottom: yMin
			})
		}
//		this.calculator.updateSetting({ lockViewport: false })
	}

	addedInputLink(link: DependencyLink) {
		super.addedInputLink(link)
		let linkedProps = this.linkedInputProperties()
		if (linkedProps.includes('min') && linkedProps.includes('max') && linkedProps.includes('binWidth') && linkedProps.includes('nbBins')) {
			this.board.removeInputLinkForPropertyAtMobject(link.endHook.outlet.name, this)
			return
		}
		if (link.endHook.outlet.name == 'min') {
			this.minInputBox.inputElement.disabled = true
		}
		if (link.endHook.outlet.name == 'max') {
			this.maxInputBox.inputElement.disabled = true
		}
		if (link.endHook.outlet.name == 'binWidth') {
			this.binWidthInputBox.inputElement.disabled = true
		}
		if (link.endHook.outlet.name == 'nbBins') {
			this.nbBinsInputBox.inputElement.disabled = true
		}
	}

	removedInputLink(link: DependencyLink) {
		super.removedInputLink(link)
		if (link.endHook.outlet.name == 'min') {
			this.minInputBox.inputElement.disabled = false
		}
		if (link.endHook.outlet.name == 'max') {
			this.maxInputBox.inputElement.disabled = false
		}
		if (link.endHook.outlet.name == 'binWidth') {
			this.binWidthInputBox.inputElement.disabled = false
		}
		if (link.endHook.outlet.name == 'nbBins') {
			this.nbBinsInputBox.inputElement.disabled = false
		}

	}


















}