
import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { deepCopy } from 'core/functions/copying'
import { Color } from 'core/classes/Color'

declare var Desmos: any

export class DesmosCalculator extends Linkable {

	calculator: any
	clippingCanvas: Mobject
	innerCanvas: Mobject
	outerFrame: Rectangle
	options: object
	expressions: object
	secretInputExpressions: object // hidden definition `a=${this.a}`` of linked input property
	outputHelperExpressions: object // copy of visible definition `b = a^2` to access its numericValue
	updating: boolean
	minWidth: number
	minHeight: number

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
			clippingCanvas: new Mobject(),
			innerCanvas: new Mobject(),
			outerFrame: new Rectangle({ strokeWidth: 0 }),
			expressions: {},
			secretInputExpressions: {},
			outputHelperExpressions: {},
			updating: false,
			minWidth: 100,
			minHeight: 100
		}
	}

	setup() {
		//log('DesmosCalculator.setup')
		super.setup()
		this.setupCanvases()
		this.setupOuterFrame()
		this.boundFocus = this.focus.bind(this)
		this.ensureMinimumFrameSize()
		this.layoutFrames()
		if (!getPaper().loadedAPIs.includes('desmos-calc')) {
			this.loadDesmosAPI()
		} else {
			this.createCalculator(this.options)
		}
	}

	setupCanvases() {
		//log('DesmosCalculator.setupCanvases')
		this.clippingCanvas.view.div.id = 'clippingCanvas'
		this.innerCanvas.update({
			screenEventHandler: ScreenEventHandler.Auto
		})
		this.clippingCanvas.add(this.innerCanvas)
		this.add(this.clippingCanvas)

		this.clippingCanvas.view.div.style.overflow = 'hidden'
		this.innerCanvas.view.div.style['pointer-events'] = 'auto'
		this.innerCanvas.view.div.id = 'desmos-calc'
		window.setTimeout(function() {
			this.innerCanvas.view.div.addEventListener('click', this.boundFocus)
		}.bind(this), 100)
	}

	setupOuterFrame() {
		//log('DesmosCalculator.setupOuterFrame')
		this.add(this.outerFrame)
		this.outerFrame.update({
			screenEventHandler: ScreenEventHandler.Below
		})
		this.outerFrame.view.div.id = 'outerFrame'
	}

	ensureMinimumFrameSize() {
		//log('DesmosCalculator.ensureMinimumFrameSize')
		var changedFrame: boolean = false
		if (this.frameWidth < this.minWidth) {
			//log('padding to min width')
			this.update({ frameWidth: this.minWidth })
			changedFrame = true
		}
		if (this.frameHeight < this.minHeight) {
			//log('padding to min height')
			this.update({ frameHeight: this.minHeight })
			changedFrame = true
		}
		if (changedFrame) {
			this.layoutFrames()
		}
	}

	layoutFrames() {
		//log('DesmosCalculator.layoutFrames')
		//log(`${this.frameWidth} ${this.frameHeight}`)
		this.clippingCanvas.update({
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
		this.innerCanvas.update({
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
		this.outerFrame.update({
			width: this.frameWidth,
			height: this.frameHeight,
			strokeColor: Color.gray(0.5),
			strokeWidth: 1
		})
	}

	layoutContent() { }

	loadDesmosAPI() {
		let scriptTag = document.createElement('script')
		scriptTag.type = 'text/javascript'
		scriptTag.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
		scriptTag.onload = this.createCalculator.bind(this, this.options)
		document.head.append(scriptTag)
	}

	createCalculator(options: object = {}) {
		//log('createCalculator')
		let apis = getPaper().loadedAPIs
		if (!apis.includes('desmos-calc')) {
			apis.push('desmos-calc')
		}
		this.calculator = Desmos.GraphingCalculator(this.innerCanvas.view.div, options)
		this.calculator.observeEvent('change', this.onChange.bind(this))
		window.setTimeout(this.layoutContent.bind(this), 50)
	}

	focus() {
		//log('DesmosCalculator.focus')
		super.focus()
		this.calculator.openKeypad()
		this.innerCanvas.view.div.removeEventListener('click', this.boundFocus)
		this.board.onTap = ((e) => {
			this.blur()
		}).bind(this)
		this.board.onMouseClick = ((e) => {
			this.blur()
		}).bind(this)
	}

	boundFocus() { }

	blur() {
		//log('DesmosCalculator.blur')
		super.blur()
		let area = this.view.div.querySelector('.dcg-mq-textarea').querySelector('textarea')
		area.blur()
		this.innerCanvas.view.div.querySelector('.dcg-dom-change-wrapper').addEventListener('click', this.boundFocus)
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

	onChange(eventName: string, event: object) { }

	showKeypad() {
		log('showKeypad')
		this.calculator.openKeypad()
		window.setTimeout(function() {
			// let keypad = this.innerCanvas.view.div.querySelector('.dcg-keypad') as HTMLElement
			// var ancestor = keypad
			// while (ancestor !== this.innerCanvas.view.div) {
			// 	ancestor.style.visibility = 'visible'
			// 	ancestor = ancestor.parentNode as HTMLDivElement
			// }
			// this.clippingCanvas.view.div.style.overflow = 'visible'
		}.bind(this), 500)
	}

	hideKeypad() {
		//log('hideKeypad')
	}









}