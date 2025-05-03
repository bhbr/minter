
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log  } from 'core/functions/logging'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'


export class InputNumberBox extends Linkable {

	inputElement: HTMLInputElement
	background: Rectangle

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black()
			}),
			inputElement: document.createElement('input'),
			frameWidth: 80,
			frameHeight: 40,
			strokeWidth: 0.0,
			screenEventHandler: ScreenEventHandler.Self,
			inputProperties: [],
			outputProperties: []
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
		this.inputElement.value = newValue.toString()
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
		this.inputElement.style.width = '80%'
		this.inputElement.style.padding = '3px 3px'
		this.inputElement.style.color = 'white'
		this.inputElement.style.backgroundColor = 'black'
		this.inputElement.style.textAlign = 'center'
		this.inputElement.style.verticalAlign = 'center'
		this.inputElement.style.fontSize = '16px'
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
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

	}

}



export class LinkableInputNumberBox extends InputNumberBox {

	defaults(): object {
		return {
			outputProperties: [
				{ name: 'value', type: 'number' }
			]
		}
	}
}


