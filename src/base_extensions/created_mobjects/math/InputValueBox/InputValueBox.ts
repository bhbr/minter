import { Rectangle } from 'base_extensions/mobjects/shapes/Rectangle'
import { TextLabel } from 'base_extensions/mobjects/TextLabel'
import { Color } from 'core/helpers/Color'
import { LinkableMobject } from 'core/mobject/linkable/LinkableMobject'
import { log, getPaper, getSidebar } from 'core/helpers/helpers'
import { ScreenEvent, ScreenEventHandler, isTouchDevice } from 'core/mobject/screen_events'
import { SidebarButton } from 'core/sidebar/buttons/SidebarButton'

export class InputValueBox extends LinkableMobject {

	value: number
	inputBox: HTMLInputElement
	background: Rectangle

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			viewWidth: 80,
			viewHeight: 40,
			inputNames: [],
			outputNames: ['value'],
			strokeWidth: 0.0,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	onPointerUp(e: ScreenEvent) {
		this.inputBox.focus()
		document.addEventListener('keydown', this.boundKeyPressed)
		getPaper().activeKeyboard = false
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = false
		}
	}

	statefulSetup() {
		super.statefulSetup()
		this.background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight,
			fillColor: Color.black()
		})
		this.inputBox = document.createElement('input')
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