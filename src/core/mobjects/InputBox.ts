
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log  } from 'core/functions/logging'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { Mobject } from './Mobject'

export class InputBox extends Mobject {

	value: any
	inputElement: HTMLInputElement

	defaults(): object {
		return {
			inputElement: document.createElement('input'),
			frameWidth: 80,
			frameHeight: 40,
			strokeWidth: 0.0,
			screenEventHandler: ScreenEventHandler.Self,
			value: 0
		}
	}

	mutabilities(): object {
		return {
			inputBox: 'never'
		}
	}

	onPointerUp(e: ScreenEvent) {
		this.focus()
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
		this.inputElement.setAttribute('type', 'text')
		this.inputElement.style.width = '90%'
		this.inputElement.style.padding = '3px 3px'
		this.inputElement.style.color = 'white'
		this.inputElement.style.backgroundColor = 'black'
		this.inputElement.style.textAlign = 'left'
		this.inputElement.style.verticalAlign = 'center'
		this.inputElement.style.fontSize = '16px'
		this.inputElement.value = this.value
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









}