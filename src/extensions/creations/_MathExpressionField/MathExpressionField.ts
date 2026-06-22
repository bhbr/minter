
import { Linkable } from 'core/linkables/Linkable'
import { Rectangle } from 'core/shapes/Rectangle'
import { ScreenEventHandler, ScreenEvent, isTouchDevice } from 'core/mobjects/screen_events'
import { getPaper, getSidebar } from 'core/functions/getters'
import { log } from 'core/functions/logging'
//import { Lexer } from './Lexer'
//import { Parser } from './Parser'
//import { createMathNode } from './createMathNode'
import { equalArrays, remove } from 'core/functions/arrays'
import { IOProperty } from 'core/linkables/Linkable'
//import { AssignmentNode } from './MathNode'
import { vertex } from 'core/functions/vertex'
import { TextLabel } from 'core/ui/TextLabel'
import { Color } from 'core/classes/Color'
import { DesmosCalculator } from 'extensions/creations/DesmosCalculator/DesmosCalculator'
import { Mobject } from 'core/mobjects/Mobject'
import { roundedString } from 'core/functions/various'

declare var MathQuill: any
declare var Desmos: any

export class MathExpressionField extends Linkable {

	MQ: any
	mathField: any
	mathFieldLoadingID: number | null
	span: HTMLSpanElement | null
	resultSpan: HTMLSpanElement | null
	resultMathField: any
	scope: object
	//parser: Parser
	value: number | null
	resultBox: Mobject
	grapher: DesmosCalculator

	defaults(): object {
		return {
			frameWidth: 100,
			frameHeight: 50,
			screenEventHandler: ScreenEventHandler.Self,
			MQ: null,
			mathField: null,
			mathFieldLoadingID: null,
			resultMathField: null,
			span: null,
			resultSpan: null,
			scope: {},
			//parser: new Parser([]),
			value: null,
			resultBox: new Mobject({
				anchor: [105, 0],
				frameWidth: 100,
				frameHeight: 60,
				backgroundColor: Color.black(),
			}),
			grapher: new DesmosCalculator({
				anchor: [0, 65],
				frameWidth: 300,
				frameHeight: 300,
				options: {
					expressions: false
				}
			})
		}
	}

	setup() {
		super.setup()
		this.add(this.grapher)
		this.add(this.resultBox)
		if (!getPaper().loadedAPIs.includes('mathquill')) {
			this.loadMathQuillAPI()
		} else {
			this.createMathField()
			this.createResultBox()
		}
		this.boundKeyPressed = this.keyPressed.bind(this)
		this.view.div.addEventListener('keydown', this.boundKeyPressed.bind(this))

	}

	mathFieldWidth(): number {
		if (!this.span) { return 0 }
		return this.span.clientWidth
	}

	resultBoxAnchor(): vertex {
		return [this.mathFieldWidth(), 0]
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
					this.createMathField()
					this.createResultBox()
				}.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

	createMathField() {
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
		this.mathField = this.MQ.MathField(this.span, {
			handlers: {
				edit: function() {
					this.updateIOProperties()
					this.updateValue()
					this.updateResultBox()
					this.updateLayout()
				}.bind(this)
			}
		})
		this.mathFieldLoadingID = window.setInterval(this.checkIfMathFieldLoaded.bind(this), 100)
		this.updateIOProperties()
		this.update({
			frameWidth: this.span.clientWidth,
			frameHeight: this.span.clientHeight
		})
	}

	checkIfMathFieldLoaded() {
		if (this.mathField) {
			window.clearInterval(this.mathFieldLoadingID)
			this.mathFieldLoadingID = null
			this.onMathFieldLoaded()
		}
	}

	onMathFieldLoaded() {
		this.mathField.write(' ')
		this.focus()
	}

	createResultBox() {
		let p = document.createElement('p')
		this.resultSpan = document.createElement('span')
		this.resultSpan.style.color = 'white'
		this.resultSpan.style.fontSize = '28px'
		this.resultSpan.style.backgroundColor = Color.gray(0.5).toCSS()
		p.append(this.resultSpan)
		this.resultBox.view.div.append(p)
		this.resultMathField = this.MQ.StaticMath(this.resultSpan, { })
		this.resultMathField.latex(' ')
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
	boundDeactivateKeyboard() { }

	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		this.updateLayout()
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

	updateIOProperties() {
		// try {
		// 	let tokens = this.parser.lexer.tokenizeTex(this.mathField.latex())
		// 	this.parser.tokens = tokens
		// } catch (ParseError) {
		// 	return
		// }
		// try {
		// 	let node = this.parser.parseTokens(this.parser.tokens)
		// 	let oldInputNames = this.inputNames()
		// 	let newInputNames = node.variables()
		// 	for (let v of newInputNames) {
		// 		if (!oldInputNames.includes(v) && !Object.keys(getPaper().globals).includes(v)) {
		// 			this.createInputVariable(v, NaN)
		// 		}
		// 	}
		// 	for (let v of oldInputNames) {
		// 		if (!newInputNames.includes(v)) {
		// 			this.removeInputVariable(v)
		// 		}
		// 	}
		// 	if (node instanceof AssignmentNode) {
		// 		let oldOutputName = this.outputNames()[0]
		// 		if (oldOutputName !== node.name) {
		// 			this.removeOutputVariable(oldOutputName)
		// 			this.createOutputVariable(node.name)
		// 			getPaper().globals[node.name] = this.computeValue()
		// 		}
		// 	}
		// } catch (ParseError) {
		// 	return
		// }
	}

	computeValue(): number {
		// if (!this.mathField) { return NaN }
		// let latex = this.mathField.latex()
		// let lexer = new Lexer()
		// let tokens = lexer.tokenizeTex(latex)
		// try {
		// 	let node = this.parser.parseTokens(tokens)
		// 	let result = this.parser.evaluateTex(latex, this.scope)
		// 	return result
		// } catch (ParseError) {
		// 	return NaN
		// }
		return NaN
	}

	updateValue() {
		let prop = this.outputPropertyName()
		let value = this.computeValue()
		this[prop] = value
		this.value = value
		if (prop != 'value') {
			getPaper().globals[prop] = value
		}
	}

	outputPropertyName(): string {
		return this.outputNames()[0] ?? 'value'
	}

	resultBoxText(): string {
		if (isNaN(this.value)) { return '' }
		return `=${roundedString(this.value)}`
	}

	updateResultBox() {
		this.resultBox.update({
			anchor: this.resultBoxAnchor()
		})
		if (this.resultMathField) {
			this.resultMathField.latex(this.resultBoxText())
		}
		this.resultBox.view.show()
		this.grapher.view.hide()
	}

	updateGrapher() {
		for (let [key, value] of Object.entries(this.scope)) {
			this.passVariableToCalculator(key, value)
		}

		this.grapher.calculator.setExpression({
			id: `func`,
			latex: this.mathField.latex(),
		})

		this.grapher.calculator.updateSettings({
			xAxisLabel: this.freeVariables()[0],
			yAxisLabel: (this.outputPropertyName() !== 'value') ? this.outputPropertyName() : '',
			xAxisArrowMode: Desmos.AxisArrowModes.POSITIVE,
			yAxisArrowMode: Desmos.AxisArrowModes.POSITIVE
		})

		this.resultBox.view.hide()
		this.grapher.view.show()
	}

	passVariableToCalculator(name: string, value: number) {
		if (name == 'x' || name == 'y') {
			name += '_1'
		}
		this.grapher.calculator.setExpression({
			id: name,
			latex: name + `=${value}`
		})
	}

	updateLayout() {
		if (this.span) {
			this.update({
				frameWidth: this.span.clientWidth,
				frameHeight: this.span.clientHeight + 30
			})
		}
		this.resultBox.update({
			anchor: [this.frameWidth + 20, 0]
		})
		this.positionIOLists()
	}

	nbFreeVariables(): number {
		return this.freeVariables().length
	}

	freeVariables(): Array<string> {
		let ret: Array<string> = []
		for (let outlet of this.inputList.linkOutlets) {
			for (let hook of outlet.linkHooks) {
				if (!hook.linked) {
					ret.push(outlet.name)
				}
			}
		}
		return ret
	}

	update(args: object = {}, redraw: boolean = true) {
		for (let v of this.inputNames()) {
			if (Object.keys(args).includes(v)) {
				this.scope[v] = args[v]
			}
		}
		Object.assign(this.scope, getPaper().globals)
		this.updateValue()
		if (this.nbFreeVariables() == 0) {
			this.updateResultBox()
		} else if (this.nbFreeVariables() == 1) {
			this.updateGrapher()
		}
		super.update(args, redraw)
	}

}





















