
import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'

declare var Desmos: any

export class DesmosCalculator extends Linkable {

	calculator: any
	innerCanvas: Mobject
	outerFrame: Rectangle
	options: object

	defaults(): object {
		return {
			view: new View({
				div: document.createElement('div'),
				frameWidth: 800,
				frameHeight: 500
			}),
			screenEventHandler: ScreenEventHandler.Self,
			calculator: null,
			options: {},
			innerCanvas: new Mobject(),
			outerFrame: new Rectangle()
		}
	}

	setup() {
		super.setup()
		if (!getPaper().loadedAPIs.includes('desmos-calc')) {
			this.loadDesmosAPI()
		} else {
			this.createCalculator(this.options)
		}
		this.setupCanvas()
		this.setupOuterFrame()
	}

	loadDesmosAPI() {
		let paper = getPaper()

		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
		scriptTag.onload = this.createCalculator.bind(this, this.options)
		document.head.append(scriptTag)

		paper.loadedAPIs.push('desmos-calc')
	}


	createCalculator(options: object = {}) {
		this.calculator = Desmos.GraphingCalculator(this.innerCanvas.view.div, options)
		this.createInputVariables()
		this.calculator.observeEvent('change', this.onChange.bind(this))
	}

	createInputVariables() {
		for (let input of this.inputProperties) {
			this.createInputVariable(input.name, this[input.name])
		}
	}

	createInputVariable(name: string, value: number | Array<number>) {
		this.calculator.setExpression({
			id: name, latex: `${name}=${value}`, secret: true
		})
		this.calculator.setExpression({
			id: name + "_display", latex: `${name}`
		})
	}

	setupCanvas() {

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

	}

	setupOuterFrame() {
		this.outerFrame.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			screenEventHandler: ScreenEventHandler.Self
		})
		this.outerFrame.onPointerDown = (e) => {
			this.focus()
		}
		this.add(this.outerFrame)
	}

	focus() {
		super.focus()
		this.outerFrame.update({
			screenEventHandler: ScreenEventHandler.Below
		})
	}

	blur() {
		super.blur()
		this.outerFrame.update({
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	setDragging(flag: boolean) {
		super.setDragging(flag)
		if (flag) {
			this.outerFrame.update({
				screenEventHandler: ScreenEventHandler.Parent
			})
		} else {
			this.outerFrame.update({
				screenEventHandler: ScreenEventHandler.Self
			})
		}
	}

	onChange(eventName: string, event: object) {
		this.createInputVariables()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		for (let input of this.inputProperties) {
			if (args[input.name] !== undefined) {
				this.calculator.setExpression({
					id: input.name, latex: `${input.name}=${args[input.name]}`, secret: true
				})
			}
		}
	}


















}