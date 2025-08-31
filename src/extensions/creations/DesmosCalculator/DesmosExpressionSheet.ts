
import { DesmosCalculator } from './DesmosCalculator'
import { remove } from 'core/functions/arrays'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { log } from 'core/functions/logging'

export class DesmosExpressionSheet extends DesmosCalculator {

	width: number
	height: number

	defaults(): object {
		return {
			width: 300,
			height: 300
		}
	}

	customizeLayout() {
		let el1 = this.innerCanvas.view.div.getElementsByClassName('dcg-grapher')[0] as HTMLElement
		el1.style.visibility = 'hidden'
		this.adjustSize()
		let el3 = this.innerCanvas.view.div.getElementsByClassName('dcg-pillbox-container')[0] as HTMLElement
		el3.style.visibility = 'hidden'
		let el4 = this.innerCanvas.view.div.getElementsByClassName('dcg-add-expression-btn')[0] as HTMLElement
		el4.style.top = '-25px'
		let el5 = this.innerCanvas.view.div.getElementsByClassName('dcg-action-undo')[0] as HTMLElement
		el5.style.top = '-25px'
		el5.style.left = '-35px'
		let el6 = this.innerCanvas.view.div.getElementsByClassName('dcg-action-redo')[0] as HTMLElement
		el6.style.top = '-25px'
		el6.style.right = '-35px'
		let el8 = this.innerCanvas.view.div.getElementsByClassName('dcg-graphpaper-branding')[0] as HTMLElement
		el8.style.bottom = '0px'
	}

	adjustSize() {
		this.width = Math.max(this.width, 300)
		this.height = Math.max(this.height, 300)
		let el = this.innerCanvas.view.div.querySelector('.dcg-exppanel-outer')
		if (el) {
			this.update({
				frameWidth: this.width,
				frameHeight: this.height
			})
			let htmlel = el as HTMLElement
			htmlel.style.width = `${this.frameWidth}px`
			htmlel.style.top = '0px'
			htmlel.style.height = `${this.frameHeight}px`
		} else {
			window.setTimeout(this.adjustWidth.bind(this), 50)
		}
	}

	calculatorExpressionDict(): object {
		let dict: object = {}
		for (let expr of this.calculator.getExpressions()) {
			dict[expr['id']] = expr
		}
		return dict
	}

	onChange(eventName: string, event: object) {
		let newExpressions = this.calculatorExpressionDict()
		let nbExprBefore = Object.keys(this.expressions).length
		let nbExprAfter = Object.keys(newExpressions).length
		if (nbExprAfter > nbExprBefore) {
		 	// new expression created
			for (let [id, expr] of Object.entries(newExpressions)) {
				if (!Object.keys(this.expressions).includes(id)) {
					this.onExpressionCreated(expr)
					return
				}
			}
		} else if (nbExprAfter == nbExprBefore && !this.updating) {
			// expression edited
			for (let [id, newExpr] of Object.entries(newExpressions)) {
				let oldExpr = this.expressions[id]
				if (oldExpr === null) { continue }
				if (oldExpr['latex'] != newExpr['latex']) {
					this.onExpressionEdited(oldExpr, newExpr)
					return
				}
			}
		} else {
		 	// expression deleted
			for (let [id, expr] of Object.entries(this.expressions)) {
		 		if (!Object.keys(newExpressions).includes(id)) {
		 			this.onExpressionDeleted(expr)
		 			return
		 		}
		 	}
		}
	}

	onExpressionCreated(expression: object) {
 		this.expressions[expression['id']] = expression
	}

	onExpressionEdited(oldExpr: object, newExpr: object) {
		let id = oldExpr['id']
		if (newExpr['id'] !== id) {
			throw `Mismatched expression IDs`
		}
		// check for variable creation
		let variable = this.definedVariable(newExpr)
		let value = this.definingValue(newExpr)
		let term = this.definingTerm(newExpr)
		if (this.properties.includes(variable)) {
			// if it is a linked input variable, undo this edit
			let hook = this.inputList.hookNamed(variable)
			if (hook) {
				if (hook.linked) {
					this.calculator.setExpression({
						id: id,
						latex: this.expressions[id]['latex']
					})
				} else {
					this.update()
					this.updateDependents()
				}
				return
			}
		} else {
			if (value !== null) {
				this.createSlidableVariable(variable, value)
			} else if (term !== null && term.length > 0) {
				let isError: boolean = this.calculator.expressionAnalysis[id].isError
				if (!isError) {
					this.createOutputVariable(variable)
				}
			}
		}
		this.expressions[id]['latex'] = newExpr['latex']
	}

	onExpressionDeleted(expression: object) {
		delete this.expressions[expression['id']]
		// TODO: remove dependencies
	}

	definedVariable(expression: object): string | null {
		let tex = expression['latex']
		let parts = tex.split('=')
		if (parts.length != 2) { return null }
		if (!this.isVariableName(parts[0])) { return null }
		return parts[0]
	}

	definingValue(expression: object): number | null {
		let tex = expression['latex']
		let parts = tex.split('=')
		if (parts.length != 2) { return null }
		if (!this.isNumericValue(parts[1])) { return null }
		return parseFloat(parts[1])
	}

	definingTerm(expression: object): string | null {
		let tex = expression['latex']
		let parts = tex.split('=')
		if (parts.length != 2) { return null }
		return parts[1]
	}

	getExpressionNamed(name: string): object | null {
		if (!this.calculator) { return null }
		for (let expr of this.calculator.getExpressions()) {
			if (!expr['latex'].includes('=')) { continue }
			let variable = this.definedVariable(expr)
			if (variable === name) {
				return expr
			}
		}
		return null
	}

	getValueOf(name: string): number | null {
		let expr = this.getExpressionNamed(name)
		if (expr === null || this.outputHelperExpressions[name] === undefined) { return null }
		return this.outputHelperExpressions[name].numericValue
	}

	isVariableName(name: string): boolean {
		// only supports single-letter variable names for now
		return name.length == 1 && 'qwertzuiopasdfghjklyxcvbnmQWERTZUIOPASDFGHJKLYXCVBNM'.includes(name)
	}

	isNumericValue(value: string): boolean {
		return !isNaN(parseFloat(value))
	}

	createSlidableVariable(name: string, value: number) {
		if (name == null) { return }
	 	this.secretInputExpressions[name] = this.calculator.HelperExpression({ latex: name })
		this.createInputVariable(name, value)
		this.createOutputVariable(name)
	}

	createInputVariable(name: string, value: number) {
		this.createProperty(name, value)
		this.inputProperties.push({
			name: name,
			type: 'number',
			displayName: name
		})
		this.inputList.update({
			outletProperties: this.inputProperties
		})
		this.inputList.view.hide()
	}

	removeInputVariable(name: string) {
		if (name == null) { return }
		this.removeProperty(name)
		delete this.secretInputExpressions[name]
		for (let prop of this.inputProperties) {
			if (prop['name'] == name) {
				remove(this.inputProperties, prop)
				break
			}
		}
		this.inputList.update({
			outletProperties: this.inputProperties
		})
		this.inputList.view.hide()
	}

	createOutputVariable(name: string) {
		if (name == null) { return }
		this.createProperty(name, this.getValueOf(name))
		this.outputHelperExpressions[name] = this.calculator.HelperExpression({ latex: name })
		this.outputHelperExpressions[name].observe('numericValue', function() {
			this.update()
			this.updateDependents()
		}.bind(this))
		this.outputProperties.push({
			name: name,
			type: 'number',
			displayName: name
		})
		this.outputList.update({
			outletProperties: this.outputProperties // should not be necessary
		})
		this.outputList.view.hide()
	}

	removeOutputVariable(name: string) {
		for (let prop of this.outputProperties) {
			if (prop['name'] == name) {
				remove(this.outputProperties, prop)
				break
			}
		}
		this.outputList.update({
			outletProperties: this.outputProperties
		})
		this.outputList.view.hide()
	}

	update(args: object = {}, redraw: boolean = true) {
		// set the latex values of updated input variables contained
		this.updating = true
		for (let [key, value] of Object.entries(args)) {
			let expr = this.getExpressionNamed(key)
			if (expr === null) { continue }
			this.calculator.setExpression({
				id: expr['id'],
				latex: `${key}=${value}`
			})
		}
		for (let [id, expr] of Object.entries(this.expressions)) {
			let name = this.definedVariable(expr)
			if (name == null) { continue }
			if (Object.keys(args).includes(name)) { continue }
			if (!Object.keys(this.outputHelperExpressions).includes(name)) { continue }
			let value = this.outputHelperExpressions[name].numericValue
			args[name] = value
		}
		super.update(args, redraw)
		this.updating = false
	}

	linkFreeVariable(name: string) {
		let sliderExpr = this.getExpressionNamed(name)
		let id = sliderExpr['id']
		let value = this[name] ?? 1
		let secretInputExpr = this.calculator.setExpression({
			id: `secret_${id}`,
			latex: `${name}=${value}`,
			secret: true
		})
		this.secretInputExpressions[id] = secretInputExpr
		this.calculator.setExpression({
			id: id,
			latex: name
		})
	}

	addedInputLink(link: DependencyLink) {
		super.addedInputLink(link)
		this.linkFreeVariable(link.endHook.outlet.name)
	}

	unlinkFreeVariable(name: string) {
		let fixedExpr = this.getExpressionNamed(name)
		let id = fixedExpr['id'].split('secret_')[1]
		let value = this[name]
		delete this.secretInputExpressions[id]
		this.calculator.removeExpression({
			id: `secret_${id}`
		})
		this.calculator.setExpression({
			id: id,
			latex: `${name}=${value}`
		})
		// TODO: remove links to input variable
	}

	removedInputLink(link: DependencyLink) {
		super.removedInputLink(link)
		let hook = link.endHook ?? link.previousHook
		this.unlinkFreeVariable(hook.outlet.name)
	}

	focus() {
		super.focus()
		this.update({
			frameWidth: 502,
			frameHeight: 270
		})
		this.showKeypad()
		this.adjustSize()
	}

	blur() {
		super.blur()
		this.update({
			frameWidth: this.width,
			frameHeight: this.height
		})
		this.adjustSize()

	}




}