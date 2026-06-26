

import { getPaper, getSidebar } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { TeXLexer } from '../model/TeXLexer'
import { TeXParser } from '../model/TeXParser'
import { Mobject } from 'core/mobjects/Mobject'
import { MGroup } from 'core/mobjects/MGroup'
import { Linkable } from 'core/linkables/Linkable'
import { SentenceTree } from '../model/SentenceTypes'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { VisualFormula } from './VisualFormula'
import { VisualFormulaMaker } from './VisualFormulaMaker'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { Algebra } from '../model/Algebra'
import { remove } from 'core/functions/arrays'

declare var MathQuill: any

export class VisualCalculation extends Linkable {

	MQ: any
 	span: HTMLSpanElement | null
 	inputField: any
	inputFieldLoadingID: number | null
 	inputFieldWrapper: Mobject
 	formulas: MGroup
 	algebra: Algebra

 	defaults(): object {
		return {
			frameWidth: 100,
			frameHeight: 50,
			screenEventHandler: ScreenEventHandler.Self,
			MQ: null,
			inputField: null,
			inputFieldLoadingID: null,
			inputFieldWrapper: new Mobject(),
			span: null,
			formulas: new MGroup(),
			algebra: new Algebra()
		}
	}

	setup() {
		log('VisualCalculation.setup')
		super.setup()
		this.add(this.formulas)
		if (!getPaper().loadedAPIs.includes('mathquill') && !getPaper().loadingAPIs.includes('mathquill')) {
			this.loadMathQuillAPI()
		} else {
			this.createInputField()
		}
		this.boundKeyPressed = this.keyPressed.bind(this)
		this.view.div.addEventListener('keydown', this.boundKeyPressed.bind(this))
	}

	loadMathQuillAPI() {
		log('VisualCalculation.loadMathQuillAPI')
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
					this.createInputField()
				}.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

	createInputField() {
		this.MQ = MathQuill.getInterface(2)
		this.addDependency('frameWidth', this.inputFieldWrapper, 'frameWidth')
		this.addDependency('frameHeight', this.inputFieldWrapper, 'frameHeight')

		let p = document.createElement('p')
		this.span = document.createElement('span')
		this.span.style.color = 'white'
		this.span.style.fontSize = '28px'
		this.span.style.backgroundColor = Color.black().toCSS()
		this.span.style.border = '2px solid white'
		this.span.style.width = '200px'
		p.append(this.span)
		this.inputFieldWrapper.view.div.append(p)
		this.add(this.inputFieldWrapper)
		this.inputField = this.MQ.MathField(this.span, {
			handlers: { }
		})
		this.inputFieldLoadingID = window.setInterval(this.checkWhetherInputFieldLoaded.bind(this), 100)
		
	}

	checkWhetherInputFieldLoaded() {
		if (this.inputField) {
			window.clearInterval(this.inputFieldLoadingID)
			this.inputFieldLoadingID = null
			this.onInputFieldLoaded()
		}
	}

	onInputFieldLoaded() {
		this.inputField.write(' ')
		this.focus()
	}

	renderFirstFormula() {
		log('VisualCalculation.renderFirstFormula')
		let tex = this.inputField.latex()
		let formula = VisualFormulaMaker.texToVisual(tex)
		this.addFormula(formula)
		this.remove(this.inputFieldWrapper)
	}

	addFormula(formula: VisualFormula) {
		log('adding formula')
		log(formula)
		formula.update({
			calculation: this,
			anchor: [0, 100 * this.formulas.children.length]
		})
		this.formulas.add(formula)
	}

	focus() {
		super.focus()
		this.inputField.focus()
		this.activateKeyboard()
		getPaper().sensor.savedOnPointerUp = getPaper().sensor.onPointerUp
		getPaper().sensor.onPointerUp = this.blur.bind(this)
	}

	blur() {
		super.blur()
		this.inputField.blur()
		this.deactivateKeyboard()
		getPaper().sensor.onPointerUp = getPaper().sensor.savedOnPointerUp
		getPaper().sensor.savedOnPointerUp = function(e: ScreenEvent) { }
		this.renderFirstFormula()
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
	boundDeactivateKeyboard() { }

	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		if (e.key == '13' || e.key == 'Enter' || e.key == 'Return') {
			this.blur()
		}
	}

	showPossibleTransformations(subformula: VisualFormula) {
		log('VisualCalculation.showPossibleTransformations')
		let startTree = subformula.formulaTree
		log(startTree)
		let applicableRules = this.algebra.applicableRules(startTree)
		log(applicableRules)
		for (let [name, rule] of Object.entries(applicableRules)) {
			let resultTree = this.algebra.applyRuleToTree(name, startTree)
			let transformedFormula = VisualFormulaMaker.treeToVisual(resultTree)
			log(transformedFormula)
			this.addFormula(transformedFormula)
		}
	}

	hidePossibleTransformations(subformula: VisualFormula) { }

}










