
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { TeXLexer } from '../model/TeXLexer'
import { TeXParser } from '../model/TeXParser'
import { Mobject } from 'core/mobjects/Mobject'
import { Sentence, SentenceTree } from '../model/SentenceTypes'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'

declare var MathQuill: any

const FORMULA_PADDING = 10

export class VisualSymbol extends Mobject {

	MQ: any
 	texString: string
 	MQObject: any

 	defaults(): object {
 		return {
 			MQ: null,
 			MQObject: null,
 			texString: '0'
 		}
 	}

 	setup() {
 		super.setup()
		if (!getPaper().loadedAPIs.includes('mathquill')) {
			this.loadMathQuillAPI()
		} else {
			this.createMQObject()
		}
 	}

	loadMathQuillAPI() {
		log('loading MathQuill...')
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
					this.onload()
				}.bind(this)
				document.head.append(mqScriptTag)

			}.bind(this)
			document.head.append(jQueryScriptTag)

		}.bind(this)
		document.head.append(cssLinkTag)
	}

	onload() {
 		log('...done.')
 		getPaper().loadedAPIs.push('mathquill')
		this.createMQObject()
	}

 	createMQObject() {
		this.MQ = MathQuill.getInterface(2)
		let span = document.createElement('span')
		span.style.color = 'white'
		span.style.fontSize = '28px'
		span.style.backgroundColor = Color.clear().toCSS()
		span.style.border = 'none'
		span.style.width = 'fit-content'
		this.view.div.append(span)
		this.MQObject = this.MQ.StaticMath(span)
		this.update()
 	}

 	update(args: object = {}, redraw: boolean = true) {
 		super.update(args, redraw)
 		if (this.MQObject) {
			this.MQObject.latex(this.texString)
			this.sizeToFit()
 		}
 	}

 	sizeToFit() {
		super.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
			})
 	}

	getWidth(): number {
		return this.MQObject.el().clientWidth
	}

	getHeight(): number {
		return this.MQObject.el().clientHeight
	}

}

export class VisualFormula extends Mobject {

	mathQuillLoadingID: number | null

	defaults(): object {
		return {
			borderColor: Color.white(),
			borderWidth: 1,
			mathQuillLoadingID: null
		}
	}

	getValue(): number {
		return NaN
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (!getPaper().loadedAPIs.includes('mathquill')) {
			this.mathQuillLoadingID = window.setInterval(function() {
				if (getPaper().loadedAPIs.includes('mathquill')) {
					this.updateContent()
					window.clearInterval(this.mathQuillLoadingID)
				}
			}.bind(this), 100)
		} else {
			this.updateContent()
		}
	}

	static treeToVisual(tree: SentenceTree): VisualFormula | null {
		let symbol = tree[0]
		if (TeXLexer.isNumber(symbol)) {
			return new VisualNumber({
				value: Number(symbol),
			})
		}
		if (TeXLexer.isLetter(symbol)) {
			return new VisualVariable({
				name: symbol
			})
		}
		if (TeXLexer.isFunctionToken(symbol)) {
			let child = tree[1][0]
			return new VisualFunction({
				name: symbol,
				child: VisualFormula.treeToVisual(child)
			})
		}
		if (symbol == '\\frac') {
			let numerator = tree[1][0]
			let denominator = tree[1][0]
			return new VisualFraction({
				numerator: VisualFormula.treeToVisual(numerator),
				denominator: VisualFormula.treeToVisual(denominator)
			})
		}
		if (TeXParser.isOperator(symbol)) {
			let child1 = tree[1][0]
			let child2 = tree[1][1]
			return new VisualOperator({
				operator: symbol,
				child1: VisualFormula.treeToVisual(child1),
				child2: VisualFormula.treeToVisual(child2)
			})
		}
		if (TeXParser.isOpenParen((symbol))) {
			let child = tree[1][0]
			return new VisualGroup({
				parenType: symbol,
				child: VisualFormula.treeToVisual(child)
			})
		}
	}

	static sentenceToVisual(sentence: Sentence): VisualFormula {
		return VisualFormula.treeToVisual(TeXParser.sentenceToTree(sentence))
	}

	static texToVisual(tex: string): VisualFormula {
		return VisualFormula.treeToVisual(TeXParser.texToTree(tex))
	}

	static texToVisual2(tex: string): VisualFormula {
		return VisualFormula.sentenceToVisual(TeXLexer.texToSentence(tex))
	}

	getWidth(): number {
		return 100
	}

	getHeight(): number {
		return 50
	}

	updateContent() { }

}

export class VisualNumber extends VisualFormula {
	
	value: number
	symbol: VisualSymbol

	defaults(): object {
		return {
			value: NaN,
			symbol: new VisualSymbol()
		}
	}

	setup() {
		super.setup()
		this.add(this.symbol)
	}

	getValue(): number {
		return this.value
	}


	updateContent() {
		this.symbol.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING],
			texString: `${this.value}`
		})
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}

	getWidth(): number {
		return this.symbol.getWidth() + 2 * FORMULA_PADDING
	}

	getHeight(): number {
		return this.symbol.getHeight() + 2 * FORMULA_PADDING
	}

}

export class VisualVariable extends VisualFormula {

	name: string
	symbol: VisualSymbol

	defaults(): object {
		return {
			name: 'x',
			symbol: new VisualSymbol()
		}
	}

	setup() {
		super.setup()
		this.add(this.symbol)
	}

	getValue(): number {
		return getPaper().globals[this.name] ?? NaN
	}

	updateContent() {
		this.symbol.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING],
			texString: this.name
		})
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}

	getWidth(): number {
		return this.symbol.getWidth() + 2 * FORMULA_PADDING
	}

	getHeight(): number {
		return this.symbol.getHeight() + 2 * FORMULA_PADDING
	}

}

export class VisualFunction extends VisualFormula {

	name: string
	symbol: VisualSymbol
	child: VisualFormula
	static functionDict: Record<string, (number) => number> = {
		'id': (x) => x,
		'\\sqrt': Math.sqrt,
		'\\log': Math.log,
		'\\ln': Math.log,
		'\\exp': Math.exp,
		'\\sin': Math.sin,
		'\\cos': Math.cos,
		'\\tan': Math.tan,
		'\\cot': (x) => 1 / Math.tan(x),
		'\\sec': (x) => 1 / Math.cos(x),
		'\\csc': (x) => 1 / Math.sin(x),
		'\\arcsin': Math.asin,
		'\\arccos': Math.acos,
		'\\arctan': Math.atan,
		'\\arccot': (x) => Math.atan(1 / x),
		'\\arcsec': (x) => Math.acos(1 / x),
		'\\arccsc': (x) => Math.asin(1 / x),
		'\\sinh': Math.sinh,
		'\\cosh': Math.cosh,
		'\\tanh': Math.tanh,
		'\\arcsinh': Math.asinh,
		'\\arccosh': Math.acosh,
		'\\arctanh': Math.atanh
	}

	defaults(): object {
		return {
			name: 'id',
			symbol: new VisualSymbol(),
			child: new VisualFormula()
		}
	}

	getValue(): number {
		let f = VisualFunction.functionDict[this.name]
		return f(this.child.getValue())
	}

	setup() {
		super.setup()
		this.add(this.symbol)
		this.add(this.child)
	}

	updateContent() {
		this.symbol.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING],
			texString: this.name
		})
		this.child.update({
			anchor: [
				this.symbol.view.frame.xMax() + FORMULA_PADDING,
				FORMULA_PADDING
			]
		})
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
	}


	getWidth(): number {
		return this.symbol.getWidth() + this.child.getWidth() + 3 * FORMULA_PADDING
	}

	getHeight(): number {
		return Math.max(this.symbol.getHeight(), this.child.getHeight()) + 2 * FORMULA_PADDING
	}

}

export class VisualGroup extends VisualFormula {

	parenType: '(' | '[' | '{' | '\\{'
	child: VisualFormula
	openParenSymbol: VisualSymbol
	closeParenSymbol: VisualSymbol

	defaults(): object {
		return {
			parenType: '(',
			openParenSymbol: new VisualSymbol(),
			closeParenSymbol: new VisualSymbol(),
			child: new VisualFormula()
		}
	}

	getValue(): number {
		return this.child.getValue()
	}

	setup() {
		super.setup()
		this.add(this.openParenSymbol)
		this.add(this.child)
		this.add(this.closeParenSymbol)
	}

	updateContent() {
		this.openParenSymbol.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING],
			texString: this.parenType
		})
		this.child.update({
			anchor: [
				this.openParenSymbol.view.frame.xMax() + FORMULA_PADDING,
				FORMULA_PADDING
			]
		})
		this.closeParenSymbol.update({
			texString: TeXParser.closingParens[this.parenType],
			anchor: [
				this.openParenSymbol.view.frame.xMax() + this.child.getWidth() + 2 * FORMULA_PADDING,
				FORMULA_PADDING
			]
		})
 	}

 	getWidth(): number {
 		return this.openParenSymbol.getWidth() + this.child.getWidth() + this.closeParenSymbol.getWidth() + 4 * FORMULA_PADDING
 	}

 	getHeight(): number {
 		return Math.max(this.openParenSymbol.getHeight(), this.child.getHeight(), this.closeParenSymbol.getHeight()) + 2 * FORMULA_PADDING
 	}
}

export class VisualOperator extends VisualFormula {

	operator: string
	operatorSymbol: VisualSymbol
	child1: VisualFormula
	child2: VisualFormula

	defaults(): object {
		return {
			operator: '+',
			operatorSymbol: new VisualSymbol(),
			child1: new VisualFormula(),
			child2: new VisualFormula()
		}
	}

	getValue(): number {
		let a = this.child1.getValue()
		let b = this.child2.getValue()
		switch (this.operator) {
		case '+':
			return a + b
		case '-':
			return a - b
		case '\\cdot':
			return a * b
		case '*':
			return a * b
		case '/':
			return a / b
		case '^':
			return a ** b
		default:
			return NaN
		}
	}

	setup() {
		super.setup()
		this.add(this.operatorSymbol)
		this.add(this.child1)
		this.add(this.child2)
	}

	updateContent() {
		this.child1.update({
			anchor: [FORMULA_PADDING, FORMULA_PADDING]
		})
		this.operatorSymbol.update({
			texString: this.operator,
			anchor: [
				this.child1.getWidth() + 2 * FORMULA_PADDING,
				FORMULA_PADDING
			]
		})
		this.child2.update({
			anchor: [
				this.operatorSymbol.anchor[0] + this.operatorSymbol.getWidth() + FORMULA_PADDING,
				FORMULA_PADDING
			]
		})
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
 	}

 	getWidth(): number {
 		return this.child1.getWidth() + this.operatorSymbol.getWidth() + this.child2.getWidth() + 4 * FORMULA_PADDING
 	}

 	getHeight(): number {
 		return Math.max(this.child1.getHeight(), this.operatorSymbol.getHeight(), this.child2.getHeight()) + 2 * FORMULA_PADDING
 	}

}

export class VisualPower extends VisualOperator {



}


export class VisualFraction extends VisualOperator {

	defaults(): object {
		return {
			operator: '/'
		}
	}

	mutabilities(): object {
		return {
			operator: 'never'
		}
	}

	get numerator(): VisualFormula {
		return this.child1
	}
	set numerator(newValue: VisualFormula) {
		this.child1 = newValue
	}

	get denominator(): VisualFormula {
		return this.child2
	}
	set denominator(newValue: VisualFormula) {
		this.child2 = newValue
	}

}

export class VisualRoot extends VisualFormula {



}



















