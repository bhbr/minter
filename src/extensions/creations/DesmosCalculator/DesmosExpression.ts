
import { DesmosExpressionSheet } from './DesmosExpressionSheet'
import { log } from 'core/functions/logging'
import { removeAll, removeDuplicates } from 'core/functions/arrays'
import { View } from 'core/mobjects/View'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { getPaper } from 'core/functions/getters'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

export class DesmosExpression extends DesmosExpressionSheet {

	freeVariables: Array<string>
	outputVariable: string | null
	
	defaults(): object {
		return {
			freeVariables: [],
			outputVariable: null,
			minWidth: 300,
			minHeight: 100,
			compactWidth: 300,
			compactHeight: 100,
			expandedHeight: 300,
			frameWidth: 300,
			frameHeight: 100
		}
	}

	mutabilities(): object {
		return {
			minWidth: 'never',
			minHeight: 'never'
		}
	}


	layoutContent() {
		//log('DesmosExpression.layoutContent')
		super.layoutContent()
		let container = this.innerCanvas.view.div.querySelector('.dcg-exppanel-container') as HTMLElement
		container.style.overflow = 'hidden'
		let panel = this.innerCanvas.view.div.querySelector('.dcg-exppanel') as HTMLElement
		panel.style.overflow = 'hidden'
		let outerPanel = this.innerCanvas.view.div.querySelector('.dcg-exppanel-outer') as HTMLElement
		outerPanel.style.overflow = 'hidden'
		let list = this.innerCanvas.view.div.querySelector('.dcg-expressionlist') as HTMLElement
		list.style.overflow = 'hidden'
		let template = this.innerCanvas.view.div.querySelector('.dcg-template-expressioneach') as HTMLElement
		template.style.overflow = 'hidden'
		let logo = this.innerCanvas.view.div.getElementsByClassName('dcg-expressions-branding')[0] as HTMLElement
		logo.style.display = 'none'

		//for (let el of this.innerCanvas.view.div.querySelectorAll('*')) {
		//	(el as HTMLElement).style.visibility = 'hidden'
		//}
		let expel = this.innerCanvas.view.div.getElementsByClassName('dcg-expressionitem')[0] as HTMLDivElement
		var ancestor = expel
		while (ancestor !== this.innerCanvas.view.div) {
			ancestor.style.visibility = 'visible'
			ancestor = ancestor.parentNode as HTMLDivElement
		}
		let top = this.innerCanvas.view.div.getElementsByClassName('dcg-expression-top-bar')[0] as HTMLDivElement
		top.style.display = 'none'

		for (let tab of this.innerCanvas.view.div.getElementsByClassName('dcg-tab')) {
			(tab as HTMLElement).style.display = 'none'
		}
		let xLabel = this.innerCanvas.view.div.querySelector('[aria-label="Delete Expression 1"]') as HTMLElement
		xLabel.style.display = 'none'

		let styleEl = document.createElement('style')
		styleEl.type = 'text/css'
		styleEl.innerText = '.dcg-create-sliders { visibility: hidden; height: 0px; }'
		document.head.appendChild(styleEl)
	}

	focus() {
		//log('DesmosExpression.focus')
		super.focus()
		this.expand()
		document.addEventListener('keydown', this.boundButtonDownByKey, { capture: true })
	}

	blur() {
		//log('DesmosExpression.blur')
		super.blur()
		this.contract()
		document.removeEventListener('keydown', this.boundButtonDownByKey)
		let keypad = this.view.div.querySelector('.dcg-keypad') as HTMLElement
		keypad.style.display = 'none'
		//log(this.freeVariables)
		// if (this.freeVariables.length == 0) {
		// 	this.outerFrame.update({
		// 		screenEventHandler: ScreenEventHandler.Parent
		// 	})
		// } else {
		// 	this.outerFrame.update({
		// 		screenEventHandler: ScreenEventHandler.Below
		// 	})
		// }
	}

	setup() {
		//log('DesmosExpression.setup')
		super.setup()
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
	}

	boundButtonDownByKey(e: KeyboardEvent) { }

	buttonDownByKey(e: KeyboardEvent) {
		log('DesmosExpression.buttonDownByKey')
		if (e.key == 'Enter' || e.key == 'Return' || e.key == 'ArrowUp' || e.key == 'ArrowDown') {
			this.blur()
			e.preventDefault()
			e.stopPropagation()
		}
	}

	onChange(eventName: string, event: object) {
		let newExpressions = this.calculatorExpressionDict()
		let newExpr = newExpressions['1']

		let oldExpr = this.expressions['1'] ?? newExpr
		this.expressions['1'] =  this.expressions['1'] ?? oldExpr
		this.onExpressionEdited(oldExpr, newExpr)
	}

	isInputVariable(name: string): boolean {
		for (let prop of this.inputProperties) {
			if (prop['name'] == name) {
				return true
			}
		}
		return false
	}

	isOutputVariable(name: string): boolean {
		for (let prop of this.outputProperties) {
			if (prop['name'] == name) {
				return true
			}
		}
		return false
	}

	onExpressionEdited(oldExpr: object, newExpr: object) {

		let value = this.definingValue(newExpr)
		let isFreeVariable = (value != null && !isNaN(value))
		let h = 50 + (isFreeVariable ? 20 : 0)

		let outputVariable = this.definedVariable(newExpr)
		if (outputVariable) {
			if (!this.isOutputVariable(outputVariable)) {
				let oldOutputVariable = this.outputProperties[0]
				if (oldOutputVariable !== undefined) {
					this.removeOutputVariable(oldOutputVariable['name'])
				}
				this.createOutputVariable(outputVariable)
			}
		}

		let term = this.definingTerm(newExpr)
		if (term) {
			let inputVariables = this.extractInputVariables(term)
			for (let variable of inputVariables) {
				if (!this.isInputVariable(variable)) {
					this.createInputVariable(variable, NaN)
				}
			}

			for (let prop of this.inputProperties) {
				let name = prop['name']
				if (!inputVariables.includes(name)) {
					this.removeInputVariable(name)
				}
			}
		}

		this.expressions['1']['latex'] = newExpr['latex']
	}

	createSlidableVariable(name: string, value: number) {
		super.createSlidableVariable(name, value)
		this.freeVariables.push(name)
	}

	extractInputVariables(term: string): Array<string> {
		var term2 = term
		let specialCharsFullString = '0 1 2 3 4 5 6 7 8 9 . + - \\cdot / \\frac ( ) [ ] { } \\{ \\} \\left \\right \\sqrt ^ * \\log \\ln \\exp \\sin \\cos \\tan \\cot \\sec \\csc \\arcsin \\arccos \\arctan \\atan \\arccot \\arcsec \\arccsc \\pi'
		let specialChars = specialCharsFullString.split(' ')
		for (let char of specialChars) {
			term2 = term2.replace(char, ' ')
		}
		let arr = term2.split(' ')
		removeAll(arr, '')
		let vars = removeDuplicates(arr)
		return vars
	}

	addedInputLink(link: DependencyLink) {
		let name = link.endHook.outlet.name
		link.startHook.outlet.ioList.mobject.update()
		let secretInputExpr = this.calculator.setExpression({
			id: `secret_${name}`,
			latex: `${name}=${this[name]}`,
			secret: true
		})
		this.secretInputExpressions[name] = secretInputExpr
	}

	removedInputLink(link: DependencyLink) {
		let name = link.endHook.outlet.name
		this.calculator.removeExpression({
			id: `secret_${name}`
		})
		delete this.secretInputExpressions[name]
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		for (let [name, expr] of Object.entries(this.secretInputExpressions)) {
			this.calculator.setExpression({
				id: `secret_${name}`,
				latex: `${name}=${this[name]}`,
				secret: true
			})
		}
	}












}
