
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { log  } from 'core/functions/logging'
import { getPaper, getSidebar } from 'core/functions/getters'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobjects/screen_events'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'

export class InputValueBox extends Linkable {

	value: number
	inputBox: HTMLInputElement
	background: Rectangle

	defaults(): object {
		return {
			viewWidth: 80,
			viewHeight: 40,
			inputNames: [],
			outputNames: ['value'],
			strokeWidth: 0.0,
			screenEventHandler: ScreenEventHandler.Self,
			background: new Rectangle({
				fillColor: Color.black()
			}),
			inputBox: document.createElement('input')
		}
	}

	onPointerUp(e: ScreenEvent) {
		this.inputBox.focus()
		document.addEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

	setup() {
		super.setup()
		this.background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight
		})
		this.inputBox.setAttribute('type', 'text')
		this.inputBox.style.width = '90%'
		this.inputBox.style.padding = '3px 3px'
		this.inputBox.style.color = 'white'
		this.inputBox.style.backgroundColor = 'black'
		this.inputBox.style.textAlign = 'center'
		this.inputBox.style.verticalAlign = 'center'
		this.inputBox.style.fontSize = '20px'
		this.add(this.background)
		this.view.appendChild(this.inputBox)
		this.boundKeyPressed = this.keyPressed.bind(this)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight
		})

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
		this.updateModel({
			value: Number(this.inputBox.value)
		})
	}

	boundKeyPressed(e: ScreenEvent) { }














}