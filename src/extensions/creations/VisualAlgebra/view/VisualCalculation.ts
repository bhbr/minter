

import { getPaper, getSidebar } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { Linkable } from 'core/linkables/Linkable'
import { SentenceTree } from '../model/SentenceTypes'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { VisualFormula } from './VisualFormula'
import { VisualFormulaMaker } from './VisualFormulaMaker'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { Algebra } from '../model/Algebra'
import { remove } from 'core/functions/arrays'
import { conditionTrigger } from 'core/functions/various'
import { VisualFormulaPopover } from './VisualFormulaPopover'

declare var MathQuill: any

export class VisualCalculation extends Linkable {

	MQ: any
 	span: HTMLSpanElement | null
 	inputField: any
 	inputFieldWrapper: Mobject
 	formulas: Array<VisualFormula>
 	algebra: Algebra
 	popover: VisualFormulaPopover | null
 	maker: VisualFormulaMaker

 	defaults(): object {
		return {
			frameWidth: 100,
			frameHeight: 50,
			screenEventHandler: ScreenEventHandler.Self,
			MQ: null,
			inputField: null,
			inputFieldWrapper: new Mobject(),
			span: null,
			formulas: [],
			algebra: new Algebra(),
			popover: null,
			maker: new VisualFormulaMaker()
		}
	}

	setup() {
		super.setup()
		for (let formula of this.formulas) {
			this.add(formula)
		}
		this.createInputField()
		this.boundKeyPressed = this.keyPressed.bind(this)
		this.view.div.addEventListener('keydown', this.boundKeyPressed.bind(this))
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
		conditionTrigger((() => (this.inputField !== null)).bind(this), this.onInputFieldLoaded.bind(this))
	}

	onInputFieldLoaded() {
		this.inputField.write(' ')
		this.focus()
	}

	renderFirstFormula() {
		let tex = this.inputField.latex()
		let formula = this.maker.texToVisual(tex)
		if (formula) {
			this.addFormula(formula)
			this.remove(this.inputFieldWrapper)
		}
	}

	addFormula(formula: VisualFormula) {
		this.formulas.push(formula)
		formula.update({
			calculation: this,
			anchor: [0, 100 * this.formulas.length]
		})
		this.add(formula)
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

	showPopover(subformula: VisualFormula) {

		let startTree = subformula.formulaTree
		let applicableRules = this.algebra.applicableRules(startTree)

		this.update({
			popover: new VisualFormulaPopover({
				rootMobject: subformula,
				direction: 'bottom'
			})
		})
		let possibleFormulas: Array<VisualFormula> = []
		for (let [name, rule] of Object.entries(applicableRules)) {
			let resultTree = this.algebra.applyRuleToTree(name, startTree)
			let transformedFormula = this.maker.treeToVisual(resultTree)
			possibleFormulas.push(transformedFormula)
		}
		this.popover.update({
			formulas: possibleFormulas
		})
		subformula.add(this.popover)
		log(subformula)
		log(subformula.location)
		log(this.popover)
		log(this)
	}



}










