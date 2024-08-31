import { Rectangle } from '../shapes/Rectangle'
import { TextLabel } from '../TextLabel'
import { Color } from '../helpers/Color'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { log, getPaper, getSidebar } from '../helpers/helpers'
import { ScreenEvent, ScreenEventHandler } from '../mobject/screen_events'
import { SidebarButton } from '../../sidebar/SidebarButton'

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
		document.addEventListener('keydown', this.boundEnterPressed)
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
		this.inputBox.size = 10
		this.inputBox.setAttribute('onsubmit', 'alert()')
		this.inputBox.setAttribute('id', Date.now().toString())
		this.add(this.background)
		this.view.appendChild(this.inputBox)
		this.boundEnterPressed = this.enterPressed.bind(this)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight
		})

	}

	enterPressed(e: KeyboardEvent) {
		if (e.keyCode != 13) { return }
		this.inputBox.blur()
		getPaper().activeKeyboard = true
		for (let button of getSidebar().buttons) {
			button.activeKeyboard = true
		}
		this.updateModel({
			value: Number(this.inputBox.value)
		})
		log(this.value)
	}

	boundEnterPressed(e: ScreenEvent) { }














}