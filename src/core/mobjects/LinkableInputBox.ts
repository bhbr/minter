
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log  } from 'core/functions/logging'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { InputBox } from './InputBox'

export class LinkableInputBox extends Linkable {

	inputBox: InputBox
	background: Rectangle

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black()
			}),
			inputBox: new InputBox(),
			frameWidth: 80,
			frameHeight: 40,
			inputProperties: [],
			outputProperties: [
				{ name: 'value', type: 'any' }
			],
			strokeWidth: 0.0,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			background: 'never',
			inputBox: 'never'
		}
	}

	get value(): any {
		return this.inputBox.value
	}

	set value(newValue: any) {
		this.inputBox.value = newValue
	}

	onPointerUp(e: ScreenEvent) {
		this.focus()
	}

	focus() {
		super.focus()
		this.inputBox.focus()
	}

	setup() {
		super.setup()
		this.add(this.background)
		this.add(this.inputBox)
		this.inputBox.setup()
		this.boundKeyPressed = this.keyPressed.bind(this)
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		this.background.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		}, redraw)

	}

	keyPressed(e: KeyboardEvent) {
		if (e.which != 13) { return }
		this.inputBox.blur()
		getPaper().activeKeyboard = true
		if (!isTouchDevice) {
			for (let button of getSidebar().buttons) {
				button.activeKeyboard = true
			}
		}
		this.update({ value: this.valueFromString(this.inputBox.value) })
		this.onReturn()
	}

	onReturn() { }

	boundKeyPressed(e: ScreenEvent) { }

	valueFromString(valueString: string): any {
		return valueString
	}












}