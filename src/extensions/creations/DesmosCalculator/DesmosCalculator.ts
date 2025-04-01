
import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'

declare var Desmos: any

export class DesmosCalculator extends Linkable {

	calculator: any
	innerCanvas: Mobject
	outerFrame: Rectangle
	a: number
	aExpression: any
	b: number
	X: number
	Y: number
	YExpression: any

	defaults(): object {
		return {
			view: new View({
				div: document.createElement('div')
			}),
			screenEventHandler: ScreenEventHandler.Self,
			calculator: null,
			innerCanvas: new Mobject(),
			outerFrame: new Rectangle(),
			a: 1,
			aExpression: null,
			YExpression: null,
			b: 1,
			X: 1,
			Y: 1,
			inputNames: ['X', 'b'],
			outputNames: ['a', 'Y']
		}
	}

	setup() {
		super.setup()
		if (!getPaper().loadedAPIs.includes('desmos-calc')) {
			this.loadDesmosAPI()
		}


		this.innerCanvas.view.frame.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		})
		this.innerCanvas.update({
			screenEventHandler: ScreenEventHandler.Auto
		})
		this.add(this.innerCanvas)


		this.innerCanvas.view.div.style['pointer-events'] = 'auto'

		this.innerCanvas.view.div.id = 'desmos-calc'

		this.outerFrame.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			screenEventHandler: ScreenEventHandler.Below
		})
		this.add(this.outerFrame)

		window.setTimeout(this.createCalculator.bind(this), 1000)

	}

	loadDesmosAPI() {
		let paper = getPaper()

		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
		document.head.append(scriptTag)

		paper.loadedAPIs.push('desmos-calc')
	}

	createCalculator() {
		this.calculator = Desmos.GraphingCalculator(this.innerCanvas.view.div, {
			expressions: true
		})
		this.calculator.setExpression({id:'graph1', latex:`f(x)=ax^2+${this.b}`})

		this.calculator.setExpressions([
			{ id: 'a', latex: `a=1` },
			{ id: 'Y', latex: `Y=f(${this.X})` },
			{ id: 'point', latex: `(${this.X},Y)` }
		]);

		this.aExpression = this.calculator.HelperExpression({ latex: 'a' });
		this.YExpression = this.calculator.HelperExpression({ latex: 'Y' });

		this.aExpression.observe('numericValue.change', function() {
			this.update({ a: this.aExpression.numericValue })
		}.bind(this))
		this.YExpression.observe('numericValue.change', function() {
			this.update({ Y: this.YExpression.numericValue })
		}.bind(this))
	}

	setDragging(flag: boolean) {
		super.setDragging(flag)
		if (flag) {
			this.outerFrame.update({
				screenEventHandler: ScreenEventHandler.Parent
			})
		} else {
			this.outerFrame.update({
				screenEventHandler: ScreenEventHandler.Below
			})
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['b'] !== undefined) {
			this.calculator.setExpression({id:'graph1', latex:`f(x)=ax^2+ ${this.b}`})
		}
		if (args['X'] !== undefined) {
			this.calculator.setExpressions([
				{ id: 'Y', latex: `Y=f(${this.X})` },
				{ id: 'point', latex: `(${this.X},Y)` }
			])
		}
		super.update(args, redraw)
	}





















}