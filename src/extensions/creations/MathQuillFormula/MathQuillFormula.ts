
import { Linkable } from 'core/linkables/Linkable'
import { Rectangle } from 'core/shapes/Rectangle'
import { ScreenEventHandler, ScreenEvent, isTouchDevice } from 'core/mobjects/screen_events'
import { getPaper, getSidebar } from 'core/functions/getters'
import { log } from 'core/functions/logging'
//import { evaluateTex } from 'tex-math-parser/src/index'
import { Lexer } from './Lexer'
import { Parser } from './Parser'

declare var MathQuill: any


export class MathQuillFormula extends Linkable {

	MQ: any
	mathField: any
	scope: object

	defaults(): object {
		return {
			frameWidth: 200,
			frameHeight: 50,
			screenEventHandler: ScreenEventHandler.Self,
			MQ: null,
			mathField: null,
			scope: {}
		}
	}

	setup() {
		super.setup()
		if (!getPaper().loadedAPIs.includes('mathquill')) {
			this.loadMathQuillAPI()
			this.loadTexMathParserAPI()
		} else {
			this.createMathField()
		}
		this.boundKeyPressed = this.keyPressed.bind(this)
		this.view.div.addEventListener('keydown', this.boundKeyPressed.bind(this))
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
				mqScriptTag.onload = this.createMathField.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

	loadTexMathParserAPI() {
		log('loadTexMathParser')
		let mathJSTag = document.createElement('script')
		mathJSTag.src = 'https://cdn.jsdelivr.net/npm/mathjs'
		mathJSTag.onload = function() {
		log('done loading mathJS')
		// // 	let parserTag = document.createElement('script')
		// // 	parserTag.src = 'https://cdn.jsdelivr.net/npm/tex-math-parser'
		// // 	document.head.append(parserTag)
		}
		document.head.append(mathJSTag)
	}

	createMathField() {
		this.MQ = MathQuill.getInterface(2)
		let p = document.createElement('p')
		let span = document.createElement('span')
		span.style.color = 'white'
		span.style.caretColor = 'white'
		p.append(span)
		this.view.div.append(p)
		this.mathField = this.MQ.MathField(span, {
			handlers: {
				edit: function() {
					var enteredMath = this.mathField.latex()
					this.computeValue(enteredMath)
				}.bind(this)
			}
		})
	}

	onPointerDown(e: ScreenEvent) {
		this.focus()
	}

	activateKeyboard() {
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

	boundActivateKeyboard() { }

	deactivateKeyboard() {
		getPaper().activeKeyboard = true
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = true
		}
	}
	boundDectivateKeyboard() { }



	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		if (e.key == '13' || e.key == 'Enter' || e.key == 'Return') {
			this.blur()
		}
	}

	focus() {
		super.focus()
		this.mathField.focus()
		this.activateKeyboard()
		getPaper().sensor.savedOnPointerUp = getPaper().sensor.onPointerUp
		getPaper().sensor.onPointerUp = this.blur.bind(this)
	}

	blur() {
		super.blur()
		this.mathField.blur()
		this.deactivateKeyboard()
		getPaper().sensor.onPointerUp = getPaper().sensor.savedOnPointerUp
		getPaper().sensor.savedOnPointerUp = function(e: ScreenEvent) { }
	}

	computeValue(latex: string): number {
		let lexer = new Lexer()
		let tokens = lexer.tokenizeTex(latex)
		let parser = new Parser(tokens)
		let result = parser.evaluateTex(latex, this.scope)
		return result
	}






}