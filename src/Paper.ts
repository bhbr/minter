import { remove, log, copy, deepCopy, convertStringToArray } from './modules/helpers/helpers'
import { ScreenEventDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, isTouchDevice, ScreenEvent, ScreenEventHandler } from './modules/mobject/screen_events'
import { Vertex } from './modules/helpers/Vertex'
import { Transform } from './modules/helpers/Transform'
import { Mobject } from './modules/mobject/Mobject'
import { MGroup } from './modules/mobject/MGroup'
import { LinkableMobject } from './modules/mobject/linkable/LinkableMobject'
import { ExpandableMobject, Construction } from './modules/mobject/expandable/ExpandableMobject'
import { Color, COLOR_PALETTE } from './modules/helpers/Color'
import { Circle } from './modules/shapes/Circle'
import { Rectangle } from './modules/shapes/Rectangle'
import { RoundedRectangle } from './modules/shapes/RoundedRectangle'
import { TwoPointCircle } from './modules/shapes/TwoPointCircle'
import { Arrow } from './modules/arrows/Arrow'
import { Segment } from './modules/arrows/Segment'
import { Ray } from './modules/arrows/Ray'
import { Line } from './modules/arrows/Line'
import { Point } from './modules/creations/Point'
import { FreePoint } from './modules/creations/FreePoint'
import { BoxSlider } from './modules/slider/BoxSlider'
import { Pendulum } from './modules/pendulum/Pendulum'
import { DEGREES, TAU } from './modules/helpers/math'
import { CircularArc } from './modules/shapes/CircularArc'
import { WaveCindyCanvas } from './modules/cindy/WaveCindyCanvas'
import { LinkHook } from './modules/mobject/linkable/LinkHook'
import { LinkBullet } from './modules/mobject/linkable/LinkBullet'


export class Paper extends ExpandableMobject {

	currentColor: Color
	expandedMobject: ExpandableMobject
	pressedKeys: Array<string>

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			children: [],
			screenEventHandler: ScreenEventHandler.Self,
			expandedMobject: this,
			pressedKeys: []
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			expanded: true,
			expandedPadding: 0,
			buttons: ['DragButton', 'LinkButton', 'ExpandableButton', 'SliderButton', 'CindyButton', 'PendulumButton']
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
		this.expandButton.hide()
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
		this.expandedMobject.handleMessage(key, value)
	}

	boundButtonDownByKey(e: KeyboardEvent) { }
	boundButtonUpByKey(e: KeyboardEvent) { }

	buttonDownByKey(e: KeyboardEvent) {
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
		e.preventDefault()
		e.stopPropagation()
		remove(this.pressedKeys, e.key)
		if (e.key == 'Shift') {
			(window as any).emulatePen = false
		} else {
			this.messageSidebar({'buttonUp': e.key})
		}
	}

	get expandedAnchor(): Vertex {
		return isTouchDevice ? Vertex.origin() : new Vertex(150, 0)
	}

	expand() { }
	contract() { }

}

let paperDiv = document.querySelector('#paper_id') as HTMLElement
export const paper = new Paper({
	view: paperDiv,
	viewWidth: 1250,
	viewHeight: 1024,
})











