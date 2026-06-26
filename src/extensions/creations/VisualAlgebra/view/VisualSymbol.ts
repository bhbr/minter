
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { Color } from 'core/classes/Color'
import { remove } from 'core/functions/arrays'

declare var MathQuill: any

export class VisualSymbol extends Mobject {

	MQ: any
 	texString: string
 	MQObject: any
 	mathQuillLoadingID: number | null

 	defaults(): object {
 		return {
 			MQ: null,
 			MQObject: null,
 			texString: '0',
 			mathQuillLoadingID: null
 		}
 	}

 	setup() {
 		log(`VisualSymbol.setup for texString ${this.texString}`)
 		super.setup()
		if (!getPaper().loadedAPIs.includes('mathquill') && !getPaper().loadingAPIs.includes('mathquill')) {
			this.loadMathQuillAPI()
		} else {
			log('createMQObject directly')
			this.mathQuillLoadingID = window.setInterval(this.checkWhetherMathQuillLoaded.bind(this), 100)
		}
 	}

	loadMathQuillAPI() {
		log('VisualSymbol.loadMathQuillAPI')
		getPaper().loadingAPIs.push('mathquill')
		let cssLinkTag = document.createElement('link')
		cssLinkTag.rel = 'stylesheet'
		cssLinkTag.href = '../../mathquill-0.10.1/mathquill.css'
		cssLinkTag.onload = function() {

			let jQueryScriptTag = document.createElement('script')
			jQueryScriptTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'
			jQueryScriptTag.onload = function() {

				let mqScriptTag = document.createElement('script')
				mqScriptTag.type = 'text/javascript'
				mqScriptTag.src = '../../mathquill-0.10.1/mathquill.js'
				mqScriptTag.onload = function() {
					getPaper().loadedAPIs.push('mathquill')
					remove(getPaper().loadingAPIs, 'mathquill')
					log('...done loading MathQuill API.')
					this.onload()
				}.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

	checkWhetherMathQuillLoaded() {
		if (getPaper().loadedAPIs.includes('mathquill')) {
			window.clearInterval(this.mathQuillLoadingID)
			this.mathQuillLoadingID = null
			this.onload()
		}
	}

	onload() {
		log('VisualSymbol.onload')
		log('createMQObject after MathQuill load')
		this.createMQObject()
	}

 	createMQObject() {
 		log('VisualSymbol.createMQObject')
		this.MQ = MathQuill.getInterface(2)
		let span = document.createElement('span')
		span.style.color = 'white'
		span.style.fontSize = '28px'
		span.style.backgroundColor = Color.clear().toCSS()
		span.style.border = 'none'
		span.style.width = 'fit-content'
		span.style.cursor = 'inherit'
		//span.style.pointerEvents = 'none'
		this.view.div.append(span)
		this.MQObject = this.MQ.StaticMath(span)
		this.update()
 	}

 	update(args: object = {}, redraw: boolean = true) {
 		log('VisualSymbol.update')
 		super.update(args, redraw)
 		if (this.MQObject) {
			this.MQObject.latex(this.texString)
			this.sizeToFit()
 		}
 	}

 	sizeToFit() {
		log(`VisualSymbol.sizeToFit to ${this.getWidth()} ${this.getHeight()}`)
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
 	}

	getWidth(): number {
		if (this.MQObject) {
			return this.MQObject.el().clientWidth
		} else {
			return 50
		}
	}

	getHeight(): number {
		if (this.MQObject) {
			return this.MQObject.el().clientHeight
		} else {
			return 50
		}
	}

}