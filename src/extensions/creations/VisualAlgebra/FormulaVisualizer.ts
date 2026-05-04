
import { FormalSystem } from './FormalSystem'
import { SentenceTree } from './SentenceTypes'
import { Mobject } from 'core/mobjects/Mobject'
import { TexParser } from './TexParser'
import { log } from 'core/functions/logging'

declare var MathQuill: any


export class FormulaVisualizer extends Mobject {
	
	system: FormalSystem
	hiddenMathField: any // invisible, just for parsing TeX
	parser: TexParser

	defaults(): object {
		return {
			system: new FormalSystem(),
			hiddenMathField: null,
			parser: new TexParser()
		}
	}

	setup() {
		this.loadMathQuillAPI()
		window.setTimeout(this.createHiddenMathField.bind(this), 1000)
		// TODO: find a better way
	}

	treeToMathQuill(tree: SentenceTree): HTMLSpanElement {
		let span = document.createElement('span')
		span.style.color = 'white'
		span.style.fontSize = '28px'
		span.style.backgroundColor = 'black'
		span.style.border = '2px solid white'
		span.style.padding = '5px'
		span.style.margin = '5px'
		let topSymbol = tree[0]
		let children = tree[1]
		if (children.length == 0) {
			span.innerText = topSymbol
			return span
		} else {
			span.setAttribute('class', 'mq-non-leaf')
		}
		let childSpans: Array<HTMLSpanElement> = []
		for (let i = 0; i < children.length; i++) {
			childSpans.push(this.treeToMathQuill(children[i]))
		}
		if (['+', '-', '\\cdot'].includes(topSymbol)) {
			span.append(childSpans[0])
			let opSpan = document.createElement('span')
			opSpan.innerText = topSymbol
			opSpan.setAttribute('class', 'mq-binary-operator')
			span.append(opSpan)
			span.append(childSpans[1])
		}
		return span
	}

	createHiddenMathField() {
		let MQ = MathQuill.getInterface(2)
		let p = document.createElement('p')
		let span = document.createElement('span')
		p.append(span)
		this.view.div.append(p)
		this.hiddenMathField = MQ.MathField(span)
	}

	loadTexFormula(tex: string) {
		this.hiddenMathField.write(tex)
		window.setTimeout(function() {
			this.renderSpans()
			this.setupSubtermHighlighting()
			let node = this.parser.parseTex(tex)
			console.log(node)
		}.bind(this), 1000)
	}

	renderSpans() {
		let tex = this.hiddenMathField.latex()
		let node = this.parser.parseTex(tex)
		let tree = node.toSentenceTree()
		let span = this.treeToMathQuill(tree)
		span.id = 'mathFieldSpan'
		span.style.color = 'white'
		span.style.fontSize = '28px'
		span.style.backgroundColor = 'black'
		span.style.border = '2px solid white'
		//this.view.div.children[0].remove()
		//this.view.div.append(span)
	}

	setupSubtermHighlighting() {
		let spans = this.view.div.getElementsByTagName('span')
		for (let span of spans) {
			span.style.border = '1px solid white'
			span.style.padding = '5px'
			span.style.margin = '5px'
			span.onmouseenter = function() {
				//console.log(`entering ${span.getAttribute('class')}`)
				for (let span2 of spans) {
					span2.style.backgroundColor = 'clear'
				}
				span.style.backgroundColor = 'red'
				document.getElementById('mathFieldSpan').style.backgroundColor = 'black'
			}
			span.onmouseleave = function() {
				//console.log(`leaving ${span.getAttribute('class')}`)
				for (let span2 of spans) {
					span2.style.backgroundColor = 'black'
				}
				span.parentElement.style.backgroundColor = 'clear'
				document.getElementById('mathFieldSpan').style.backgroundColor = 'black'
			}
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
				// mqScriptTag.onload = function() {
				// 	log('loaded MathQuill API')
				// }
				document.head.append(mqScriptTag)
			}
			document.head.append(jQueryScriptTag)
		}
		document.head.append(cssLinkTag)
	}

	applyRuleNamed(ruleName: string) {
		let tex = this.hiddenMathField.latex()
		let node = this.parser.parseTex(tex)
		let tree = node.toSentenceTree()
		let tree2 = this.system.applyRuleToTree(ruleName, tree)
		let tex2 = this.system.treeToTex(tree2)
		this.loadTexFormula(tex2)
	}


}
