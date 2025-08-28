
import { VariableSheet } from './VariableSheet'
import { log } from 'core/functions/logging'

export class AlgebraExpression extends VariableSheet {
	

	customizeLayout() {
		super.customizeLayout()
		for (let el of this.innerCanvas.view.div.querySelectorAll('*')) {
			(el as HTMLElement).style.visibility = 'hidden'
		}
		let expel = this.innerCanvas.view.div.getElementsByClassName('dcg-expressionitem')[0] as HTMLDivElement
		var ancestor = expel
		while (ancestor !== this.innerCanvas.view.div) {
			ancestor.style.visibility = 'visible'
			ancestor = ancestor.parentNode as HTMLDivElement
		}
		let top = this.innerCanvas.view.div.getElementsByClassName('dcg-expression-top-bar')[0] as HTMLDivElement
		top.style.display = 'none'

		window.setTimeout(function() {
			for (let tab of this.innerCanvas.view.div.getElementsByClassName('dcg-tab')) {
				(tab as HTMLElement).style.display = 'none'
			}
			let xLabel = document.querySelector('[aria-label="Delete Expression 1"]') as HTMLElement
			xLabel.style.display = 'none'
		}.bind(this), 50)
		this.update({
			frameHeight: 50
		})
		this.view.div.style.overflow = 'hidden'
	}

	focus() {
		super.focus()
		document.addEventListener('keydown', this.boundButtonDownByKey, { capture: true })
		this.calculator.focusFirstExpression()
	}

	setup() {
		super.setup()
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
	}

	boundButtonDownByKey(e: KeyboardEvent) { }

	buttonDownByKey(e: KeyboardEvent) {
		if (e.key == 'Enter') {
			this.blur()
			e.preventDefault()
			e.stopPropagation()
		}
	}

	blur() {
		super.blur()
		document.removeEventListener('keydown', this.boundButtonDownByKey)
	}





















}
