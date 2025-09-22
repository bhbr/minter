
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Mobject } from 'core/mobjects/Mobject'
import { log } from 'core/functions/logging'
import { vertex } from 'core/functions/vertex'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { DependencyLink } from 'core/linkables/DependencyLink'
import { DraggingCreator } from 'core/creators/DraggingCreator'


export class SimpleNumberBox extends Mobject {

	inputElement: HTMLInputElement
	background: Rectangle

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black(),
				strokeWidth: 0
			}),
			inputElement: document.createElement('input'),
			frameWidth: 50,
			frameHeight: 30,
			strokeWidth: 0.0,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			background: 'never',
			inputElement: 'never'
		}
	}

	onPointerUp(e: ScreenEvent) {
		this.focus()
	}

	get value(): number {
		return Number(this.inputElement.value)
	}
	set value(newValue: number) {
		let isFalsy = [null, undefined, NaN, Infinity, -Infinity].includes(newValue)
		this.inputElement.value = isFalsy ? '' : newValue.toString()
	}

	focus() {
		super.focus()
		this.inputElement.focus()
		document.addEventListener('keydown', this.boundKeyPressed)
	}

	blur() {
		super.blur()
		this.inputElement.blur()
		document.removeEventListener('keydown', this.boundKeyPressed)
	}

	setup() {
		super.setup()
		this.add(this.background)
		this.inputElement.setAttribute('type', 'text')
		this.inputElement.style.width = '100%'
		this.inputElement.style.height = '100%'
		this.inputElement.style.padding = '0px 0px'
		this.inputElement.style.color = 'white'
		this.inputElement.style.backgroundColor = 'rgba(0, 0, 0, 0)'
		this.inputElement.style.textAlign = 'center'
		this.inputElement.style.verticalAlign = 'center'
		this.inputElement.style.fontSize = '14px'
		this.inputElement.style.border = 'none'
		this.inputElement.style.outline = 'none'
		this.inputElement.value = this.value.toString()
		this.view.div.appendChild(this.inputElement)
		this.boundKeyPressed = this.keyPressed.bind(this)
		document.addEventListener('keyup', this.boundActivateKeyboard)
	}

	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		if (e.which != 13) { return }
		this.inputElement.blur()
		getPaper().activeKeyboard = true
		if (!isTouchDevice) {
			for (let button of getSidebar().buttons) {
				button.activeKeyboard = true
			}
		}
		this.update({ value: this.valueFromString(this.inputElement.value) })
		this.updateDependents()
		this.onReturn()
	}

	valueFromString(valueString: string): any {
		return valueString
	}

	activateKeyboard() {
		document.removeEventListener('keyup', this.boundActivateKeyboard)
		document.addEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

	boundActivateKeyboard() { }

	deactivateKeyboard() {
		document.removeEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = true
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = true
		}
	}

	onReturn() { }

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['value'] !== undefined) {
			this.inputElement.textContent = `${args['value']}`
		}
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

	}

}