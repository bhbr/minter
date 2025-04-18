
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log  } from 'core/functions/logging'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'

export class InputNumberBox extends Linkable {

	value: number
	inputBox: HTMLInputElement
	background: Rectangle

	defaults(): object {
		return {
			background: new Rectangle({
				fillColor: Color.black()
			}),
			inputBox: document.createElement('input'),
			frameWidth: 80,
			frameHeight: 40,
			inputNames: [],
			outputNames: ['value'],
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

	onPointerUp(e: ScreenEvent) {
		super.focus()
		this.inputBox.focus()
		document.addEventListener('keydown', this.boundKeyPressed)
	}

	setup() {
		super.setup()
		this.add(this.background)
		this.inputBox.setAttribute('type', 'text')
		this.inputBox.style.width = '90%'
		this.inputBox.style.padding = '3px 3px'
		this.inputBox.style.color = 'white'
		this.inputBox.style.backgroundColor = 'black'
		this.inputBox.style.textAlign = 'center'
		this.inputBox.style.verticalAlign = 'center'
		this.inputBox.style.fontSize = '20px'
		this.view.div.appendChild(this.inputBox)
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
		this.update({
			value: Number(this.inputBox.value)
		})
	}

	boundKeyPressed(e: ScreenEvent) { }














}