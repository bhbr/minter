
// import { FormalSystem } from './FormalSystem'
// import { SentenceTree } from './SentenceTypes'
// import { Mobject } from 'core/mobjects/Mobject'
// import { TexParser } from './TexParser'
// import { log } from 'core/functions/logging'
// import { ScreenEvent, addPointerDown, addPointerMove, addPointerUp, addPointerOut } from 'core/mobjects/screen_events'
// import { Sensor } from 'core/mobjects/Sensor'

// declare var MathQuill: any


// class CustomSensor extends Sensor {

// 	defaults(): object {
// 		return { }
// 	}

// 	capturedOnPointerDown(e: ScreenEvent) { }
// 	capturedOnPointerMove(e: ScreenEvent) { }

// 	capturedOnPointerUp(e: ScreenEvent) {
// 		this.mobject.onPointerUp(e)
// 	}
// }

// export class FormulaVisualizer extends Mobject {
	
// 	system: FormalSystem
// 	hiddenMathField: any // invisible, just for parsing TeX
// 	parser: TexParser
// 	texToMathQuill: Record<string, string>
// 	subTrees: Record<string,SentenceTree>
// 	subElements: Record<string,HTMLElement>
// 	declare sensor: CustomSensor

// 	defaults(): object {
// 		return {
// 			frameWidhth: 500,
// 			frameHeight: 250,
// 			system: new FormalSystem(),
// 			hiddenMathField: null,
// 			parser: new TexParser(),
// 			subTrees: {},
// 			subElements: {},
// 			texToMathQuill: {
// 				'\\cdot': '·',
// 				'\\pi': 'π'
// 			},
// 			sensor: new CustomSensor()
// 		}
// 	}


// 	setup() {
// 		this.view.mobject = this
// 		this.view.setup()
// 		this.motor.mobject = this
// 		this.sensor.mobject = this

// 		// put into sensor setup?
// 		addPointerDown(this.view.div, this.sensor.capturedOnPointerDown.bind(this.sensor))
// 		addPointerMove(this.view.div, this.sensor.capturedOnPointerMove.bind(this.sensor))
// 		addPointerUp(this.view.div, this.sensor.capturedOnPointerUp.bind(this.sensor))
// 		addPointerOut(this.view.div, this.sensor.capturedOnPointerOut.bind(this.sensor))

// 		this.loadMathQuillAPI()
// 		window.setTimeout(this.createHiddenMathField.bind(this), 2000)
// 	}

// 	treeToMathQuill(tree: SentenceTree): HTMLSpanElement {
// 		let key = this.system.treeToPolish(tree)
// 		this.subTrees[key] = tree
// 		let span = document.createElement('span')
// 		span.style.color = 'white'
// 		span.style.fontSize = '28px'
// 		span.style.backgroundColor = 'blue'
// 		span.style.border = '2px solid green'
// 		span.style.padding = '5px'
// 		span.style.margin = '5px'
// 		let topSymbol = tree[0]
// 		let children = tree[1]
// 		if (children.length == 0) {
// 			if (this.system.isVariable(topSymbol)) {
// 				let v = document.createElement('var')
// 				v.style.color = 'white'
// 				v.style.fontSize = '28px'
// 				v.style.backgroundColor = 'blue'
// 				v.style.border = '2px solid green'
// 				v.style.padding = '5px'
// 				v.style.margin = '5px'
// 				v.innerText = topSymbol
// 				this.subElements[key] = v
// 				return v
// 			}
// 			span.setAttribute('class', 'mq-nonSymbola')
// 			span.innerText = this.texToMathQuill[topSymbol] ?? topSymbol
// 			this.subElements[key] = span
// 			return span
// 		} else {
// 			span.setAttribute('class', 'mq-non-leaf')
// 		}
// 		let childSpans: Array<HTMLSpanElement> = []
// 		for (let i = 0; i < children.length; i++) {
// 			childSpans.push(this.treeToMathQuill(children[i]))
// 		}
// 		if (['+', '-', '\\cdot'].includes(topSymbol)) {
// 			span.append(childSpans[0])
// 			let opSpan = document.createElement('span')
// 			opSpan.innerText = this.texToMathQuill[topSymbol] ?? topSymbol
// 			opSpan.setAttribute('class', 'mq-binary-operator')
// 			opSpan.style.border = '0px'
// 			span.append(opSpan)
// 			span.append(childSpans[1])
// 		} else if (['\\sqrt'].includes(topSymbol)) {
// 			let opSpan1 = document.createElement('span')
// 			opSpan1.setAttribute('class', 'mq-scaled mq-sqrt-prefix')
// 			opSpan1.style.transform = 'scale(1, 0.93)'
// 			opSpan1.innerText = '√'
// 			let opSpan2 = document.createElement('span')
// 			opSpan2.setAttribute('class', 'mq-non-leaf q-sqrt-stem')
// 			opSpan2.append(childSpans[0])
// 			opSpan2.style.borderTop = '1px solid white'
// 		  // margin-top: 1px;
// 		  // padding-left: .15em;
// 		  // padding-right: .2em;
// 		  // margin-right: .1em;
// 		  // padding-top: 1px;
// 			span.append(opSpan1)
// 			span.append(opSpan2)
// 		}
// 		this.subElements[key] = span
// 		return span
// 	}

// 	createHiddenMathField() {
// 		let MQ = MathQuill.getInterface(2)
// 		let p = document.createElement('p')
// 		let span = document.createElement('span')
// 		p.append(span)
// 		this.view.div.append(p)
// 		this.hiddenMathField = MQ.MathField(span)
// 	}

// 	loadTexFormula(tex: string) {
// 		this.hiddenMathField.write(tex)
// 		window.setTimeout(function() {
// 			this.renderSpans()
// 			this.setupSubtermHighlighting()
// 			let node = this.parser.parseTex(tex)
// 			log('final subtrees:')
// 			log(this.subTrees)
// 		}.bind(this), 1000)
// 	}

// 	renderSpans() {
// 		let tex = this.hiddenMathField.latex()
// 		let node = this.parser.parseTex(tex)
// 		let tree = node.toSentenceTree()
// 		let span = this.treeToMathQuill(tree)
// 		span.id = 'mathFieldSpan'
// 		span.removeAttribute('class')
// 		span.setAttribute('class', 'mq-root-block')
// 		span.style.color = 'white'
// 		span.style.fontSize = '28px'
// 		span.style.backgroundColor = 'blue'
// 		//span.style.border = '2px solid white'
// 		span.style.fontFamily = 'Symbola'
// 		let wrapSpan = document.createElement('span')
// 		wrapSpan.setAttribute('class', 'mq-editable-field mq-math-mode')
// 		wrapSpan.style.top = '100px'
// 		wrapSpan.append(span)
// 		//this.view.div.children[0].remove()
// 		this.view.div.append(wrapSpan)
// 	}

// 	setupSubtermHighlighting() {
// 		let spans = this.view.div.getElementsByTagName('span')
// 		for (let span of spans) {
// 			span.style.padding = '5px'
// 			span.style.margin = '5px'
// 			if (!span.classList.contains('mq-root-block') && !span.classList.contains('mq-non-leaf')) {
// 				continue
// 			}
// 			span.onmouseenter = function() {
// 				this.clearAllSubtermBackgrounds()
// 				span.style.backgroundColor = 'red'
// 			}.bind(this)
// 			span.onmouseleave = function() {
// 				this.clearAllSubtermBackgrounds()
// 				span.parentElement.style.backgroundColor = 'red'
// 			}.bind(this)
// 		}
// 		let vars = this.view.div.getElementsByTagName('var')
// 		for (let v of vars) {
// 			v.onmouseenter = function() {
// 				this.clearAllSubtermBackgrounds()
// 				v.style.backgroundColor = 'red'
// 			}.bind(this)
// 			v.onmouseleave = function() {
// 				v.parentElement.style.backgroundColor = 'red'
// 			}.bind(this)
// 		}
// 	}

// 	clearAllSubtermBackgrounds() {
// 		let spans = this.view.div.getElementsByTagName('span')
// 		let vars = this.view.div.getElementsByTagName('var')
// 		for (let span2 of spans) {
// 			span2.style.backgroundColor = 'transparent'
// 		}
// 		for (let v2 of vars) {
// 			v2.style.backgroundColor = 'transparent'
// 		}
// 		this.view.div.style.background = 'blue'
// 	}

// 	loadMathQuillAPI() {
// 		let cssLinkTag = document.createElement('link')
// 		cssLinkTag.rel = 'stylesheet'
// 		cssLinkTag.href = '../../mathquill-0.10.1/mathquill.css'
// 		cssLinkTag.onload = function() {
// 			let jQueryScriptTag = document.createElement('script')
// 			jQueryScriptTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'
// 			jQueryScriptTag.onload = function() {
// 				let mqScriptTag = document.createElement('script')
// 				mqScriptTag.type = 'text/javascript'
// 				mqScriptTag.src = '../../mathquill-0.10.1/mathquill.js'
// 				// mqScriptTag.onload = function() {
// 				// 	log('loaded MathQuill API')
// 				// }
// 				document.head.append(mqScriptTag)
// 			}
// 			document.head.append(jQueryScriptTag)
// 		}
// 		document.head.append(cssLinkTag)
// 	}

// 	applyRuleNamed(ruleName: string) {
// 		let tex = this.hiddenMathField.latex()
// 		let node = this.parser.parseTex(tex)
// 		let tree = node.toSentenceTree()
// 		let tree2 = this.system.applyRuleToTree(ruleName, tree)
// 		let tex2 = this.system.treeToTex(tree2)
// 		this.loadTexFormula(tex2)
// 	}



// 	elementToTree(el: HTMLElement): SentenceTree | null {
// 		for (let [key, value] of Object.entries(this.subElements)) {
// 			if (value === el) {
// 				return this.subTrees[key]
// 			}
// 		}
// 		return null
// 	}

// 	onPointerUp(e: ScreenEvent) {
// 		let span = e.target as HTMLElement
// 		let subTree = this.elementToTree(span)
// 		for (let [key, rule] of Object.entries(this.system.rules)) {
// 			let match = this.system.matchSentenceTreeForm(rule[0], subTree)
// 			if (match !== null) {
// 				let newTree = this.system.applyRuleToTree(key, subTree)
// 				let newElement = this.treeToMathQuill(newTree)
// 				newElement.style.width = '500px'
// 				span.replaceWith(newElement)
// 			}
// 		}
// 	}


// }
