

import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { TeXLexer } from '../model/TeXLexer'
import { TeXParser } from '../model/TeXParser'
import { Mobject } from 'core/mobjects/Mobject'
import { SentenceTree } from '../model/SentenceTypes'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'

declare var MathQuill: any

export class VisualCalculation extends Mobject {

	MQ: any
 	span: HTMLSpanElement | null
 	mathInputField: any

 	defaults(): object {
		return {
			frameWidth: 100,
			frameHeight: 50,
			screenEventHandler: ScreenEventHandler.Self,
			MQ: null,
			mathInputField: null,
			mathInputFieldLoadingID: null,
			span: null
		}
	}

	setup() {
		super.setup()
		if (!getPaper().loadedAPIs.includes('mathquill')) {
			this.loadMathQuillAPI()
		} else {
			this.createMathInputField()
		}
	}

	loadMathQuillAPI() {
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
					this.createMathInputField()
				}.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

	createMathInputField() {
		this.MQ = MathQuill.getInterface(2)
		let mob = new Mobject()
		this.addDependency('frameWidth', mob, 'frameWidth')
		this.addDependency('frameHeight', mob, 'frameHeight')

		let p = document.createElement('p')
		this.span = document.createElement('span')
		this.span.style.color = 'white'
		this.span.style.fontSize = '28px'
		this.span.style.backgroundColor = Color.black().toCSS()
		this.span.style.border = '2px solid white'
		this.span.style.width = '200px'
		p.append(this.span)
		mob.view.div.append(p)
		this.add(mob)
		this.mathInputField = this.MQ.MathField(this.span, {
			handlers: {
				edit: function() {
					this.updateLayout()
				}.bind(this)
			}
		})
	}

}










