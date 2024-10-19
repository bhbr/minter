
import { LinkHook } from 'core/linkables/LinkHook'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { getPaper, getSidebar } from 'core/functions/getters'

export class EditableLinkHook extends LinkHook {
	
	inputBox: HTMLInputElement

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			inputBox: document.createElement('input'),
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	setup() {
		super.setup()
		this.inputBox.setAttribute('type', 'text')
		this.inputBox.style.width = '90%'
		this.inputBox.style.padding = '3px 3px'
		this.inputBox.style.color = 'white'
		this.inputBox.style.backgroundColor = 'black'
		this.inputBox.style.textAlign = 'left'
		this.inputBox.style.verticalAlign = 'center'
		this.inputBox.style.fontSize = '20px'
		this.inputBox.style.position = 'absolute'
		this.inputBox.style.top = '0px'
		this.inputBox.style.left = '30px'
		this.inputBox.style.width = '150px'
		this.view.appendChild(this.inputBox)
		this.boundKeyPressed = this.keyPressed.bind(this)
	}

	onPointerUp(e: ScreenEvent) {
		this.inputBox.focus()
		document.addEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

	boundKeyPressed(e: ScreenEvent) { }

	keyPressed(e: KeyboardEvent) {
		if (e.which != 13) { return }
		this.inputBox.blur()
		getPaper().activeKeyboard = true
		if (!isTouchDevice) {
			for (let button of getSidebar().buttons) {
				button.activeKeyboard = true
			}
		}
		this.update({
			name: this.inputBox.value
		})
		console.log(this.name)
	}
}