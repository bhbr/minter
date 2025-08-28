
import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { deepCopy } from 'core/functions/copying'

declare var Desmos: any

export class DesmosCalculator extends Linkable {

	calculator: any
	innerCanvas: Mobject
	outerFrame: Rectangle
	options: object
	expressions: object
	secretInputExpressions: object // hidden definition `a=${this.a}`` of linked input property
	outputHelperExpressions: object // copy of visible definition `b = a^2` to access its numericValue
	updating: boolean

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
			outerFrame: new Rectangle(),
			expressions: {},
			secretInputExpressions: {},
			outputHelperExpressions: {},
			updating: false
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
		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
		scriptTag.onload = this.createCalculator.bind(this, this.options)
		document.head.append(scriptTag)
		getPaper().loadedAPIs.push('desmos-calc')
	}


	createCalculator(options: object = {}) {
		this.calculator = Desmos.GraphingCalculator(this.innerCanvas.view.div, options)
		this.calculator.observeEvent('change', this.onChange.bind(this))
		this.customizeLayout()
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
		let area = this.view.div.querySelector('.dcg-mq-textarea').querySelector('textarea')
		log(area)
		area.blur()
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

	customizeLayout() { }

	onChange(eventName: string, event: object) { }















}