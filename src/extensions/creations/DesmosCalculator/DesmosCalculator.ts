
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
			outputNames: ['a']
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
			expressions: false
		})
		this.calculator.setExpression({id:'graph1', latex:'f(x)=x^2'})

		this.calculator.setExpressions([
			{ id: 'xValue', latex: `a=${this.a}` },
			{ id: 'point', latex: '(a,f(a))' }
		]);

		var a = this.calculator.HelperExpression({ latex: 'a' });

		a.observe('numericValue.change', function() {
			this.update({ a: a.numericValue })
			
		}.bind(this));
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


}