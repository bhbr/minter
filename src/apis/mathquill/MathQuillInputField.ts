
import { Rectangle } from '../../shapes/Rectangle.js'
import { ScreenEventHandler, ScreenEvent, isTouchDevice } from '../../mobjects/screen_events.js'
import { getPaper } from '../../paper/getPaper.js'
import { getSidebar } from '../../sidebar/getSidebar.js'
import { log } from '../../functions/logging.js'
import { vertex } from '@bhbr/affr2'
import { Mobject } from '../../mobjects/Mobject.js'
import { Color } from '../../views/Color.js'

declare var MathQuill: any

export class MathQuillInputField extends Mobject {

	MQ: any
	mathField: any
	mathFieldLoadingID: number | null
	span: HTMLSpanElement | null
	initialTeX: string

	defaults(): object {
		return {
			frameWidth: 100,
			frameHeight: 50,
			screenEventHandler: ScreenEventHandler.Self,
			MQ: null,
			mathField: null,
			mathFieldLoadingID: null,
			span: null,
			initialTeX: ' '
		}
	}

	get tex(): string {
			return this.mathFieldIsLoaded() ? this.mathField.latex() : this.initialTeX
	}
	set tex(newValue: string) {
		if (this.mathFieldIsLoaded()) {
			this.mathField.write(newValue)
		} else {
			this.initialTeX = newValue
		}
	}

	setup() {
		super.setup()
		this.createMathField()

		this.boundKeyPressed = this.keyPressed.bind(this)
		this.view.div.addEventListener('keydown', this.boundKeyPressed.bind(this))

	}

	mathFieldWidth(): number {
		if (!this.span) { return 0 }
		return this.span.clientWidth
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
				edit: this.updateLayout.bind(this)
			}
		})
		this.mathFieldLoadingID = window.setInterval(this.checkIfMathFieldLoaded.bind(this), 100)
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

	mathFieldIsLoaded(): boolean {
		return this.mathField && this.mathFieldLoadingID === null	
	}

	onMathFieldLoaded() {
		this.mathField.write(this.initialTeX)
		this.initialTeX = ''
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

	updateLayout() {
		if (this.span) {
			this.update({
				frameWidth: this.span.clientWidth,
				frameHeight: this.span.clientHeight + 30
			})
		}
	}

}





















