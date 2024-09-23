
import { log } from 'core/functions/logging'
import { remove, convertStringToArray } from 'core/functions/arrays'
import { ScreenEventDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, isTouchDevice, ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Board } from 'core/boards/Board'
import { Color } from 'core/classes/Color'
import { COLOR_PALETTE } from 'core/constants'

// StartPaper needs to be imported *somewhere* for TS to compile it
import { StartPaper } from 'startPaper'

export class Paper extends Board {

	currentColor: Color
	expandedMobject: Board
	pressedKeys: Array<string>
	activeKeyboard: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			children: [],
			screenEventHandler: ScreenEventHandler.Self,
			expandedMobject: this,
			pressedKeys: [],
			activeKeyboard: true,
			view: document.querySelector('#paper_id') as HTMLDivElement,
			viewWidth: 1216,
			viewHeight: 1024
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			expanded: true,
			expandedPadding: 0
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.currentColor = COLOR_PALETTE['white']
	}

	statefulSetup() {
		super.statefulSetup()
		this.boundButtonUpByKey = this.buttonUpByKey.bind(this)
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
		document.addEventListener('keydown', this.boundButtonDownByKey)
		document.addEventListener('keyup', this.boundButtonUpByKey)
		this.background.update({
			cornerRadius: 0,
			strokeColor: Color.clear(),
			strokeWidth: 0.0
		})
	}

	changeColorByName(newColorName: string) {
		let newColor: Color = COLOR_PALETTE[newColorName]
		this.changeColor(newColor)
	}

	changeColor(newColor: Color) {
		this.currentColor = newColor
	}

	getMessage(message: object) {
		let key: string = Object.keys(message)[0]
		let value: string | boolean | number | Array<string> = Object.values(message)[0]
		if (value == "true") { value = true }
		if (value == "false") { value = false }
		if (typeof value == "string") {
			if ((value as string)[0] == "(") {
				value = convertStringToArray(value)
			}
		}
		if ((key == "link" || key == "drag") && typeof value === "string") {
			value = (value as string === "1")
		}
		if (key == "init" && value == "sidebar") {
			this.initSidebar()
		}
		this.expandedMobject.handleMessage(key, value)
	}

	boundButtonDownByKey(e: KeyboardEvent) { }
	boundButtonUpByKey(e: KeyboardEvent) { }

	buttonDownByKey(e: KeyboardEvent) {
		if (!this.activeKeyboard) { return }
		e.preventDefault()
		e.stopPropagation()
		if (this.pressedKeys.includes(e.key)) { return }
		let alphanumericKeys = "1234567890qwertzuiopasdfghjklyxcvbnm".split("")
		let specialKeys = [" ", "Alt", "Backspace", "CapsLock", "Control", "Dead", "Escape", "Meta", "Shift", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
		let availableKeys = alphanumericKeys.concat(specialKeys)
		if(!availableKeys.includes(e.key)) { return }
		this.pressedKeys.push(e.key)
		if (e.key == 'Shift') {
			(window as any).emulatePen = true
		} else {
			this.messageSidebar({'buttonDown': e.key})
		}
	}

	buttonUpByKey(e: KeyboardEvent) {
		if (!this.activeKeyboard) { return }
		e.preventDefault()
		e.stopPropagation()
		remove(this.pressedKeys, e.key)
		if (e.key == 'Shift') {
			(window as any).emulatePen = false
		} else {
			this.messageSidebar({'buttonUp': e.key})
		}
	}

	expandedAnchor(): Vertex {
		return isTouchDevice ? Vertex.origin() : new Vertex(150, 0)
	}

	expand() { }
	contract() { }

}


























