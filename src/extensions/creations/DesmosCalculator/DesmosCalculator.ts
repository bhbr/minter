
import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'
import { ExtendedObject } from 'core/classes/ExtendedObject'
import { deepCopy } from 'core/functions/copying'
import { remove } from 'core/functions/arrays'
import { DependencyLink } from 'core/linkables/DependencyLink'

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
			}
			 else if (term !== null && term.length > 0) {
				this.createOutputVariable(variable)
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

	customizeLayout() {
		let el1 = this.innerCanvas.view.div.getElementsByClassName('dcg-grapher')[0] as HTMLElement
		el1.style.visibility = 'hidden'
		let el2 = this.innerCanvas.view.div.getElementsByClassName('dcg-exppanel-outer')[0] as HTMLElement
		el2.style.width = `${this.frameWidth}px`
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
		let el7 = this.innerCanvas.view.div.getElementsByClassName('dcg-exppanel-outer')[0] as HTMLElement
		el7.style.top = '0px'
		el7.style.height = `${this.frameHeight}px`
		let el8 = this.innerCanvas.view.div.getElementsByClassName('dcg-graphpaper-branding')[0] as HTMLElement
		el8.style.bottom = '0px'
	}















}