
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { rgb, gray } from 'core/functions/colors'
import { TAU } from 'core/constants'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Transform } from 'core/classes/vertex/Transform'
import { convertStringToArray } from 'core/functions/arrays'
import { getPaper } from 'core/functions/getters'
import { Color } from 'core/classes/Color'
import { COLOR_PALETTE } from 'core/constants'
import { Rectangle } from 'core/shapes/Rectangle'
import { buttonCenter, BUTTON_CENTER_X, BUTTON_CENTER_Y, BUTTON_SPACING, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from 'core/sidebar_buttons/button_geometry'
import { Paper } from 'core/Paper'
import { Mobject } from 'core/mobjects/Mobject'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'

//var paper: Paper = null
interface Window { webkit?: any }


export class Sidebar extends Mobject {

	background: Rectangle
	availableButtonClasses: Array<any>
	buttons: Array<SidebarButton>
	activeButton: SidebarButton

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			viewWidth: 150,
			viewHeight: 1024,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			view: document.querySelector('#sidebar_id') as HTMLElement,
			availableButtonClasses: [
				DragButton,
				LinkButton
			],
			buttons: [
				new DragButton(),
				new LinkButton()
			]
		})
	}

	statelessSetup() {
		this.background = new Rectangle({
			fillColor: Color.gray(0.1),
			fillOpacity: 1.0,
			strokeWidth: 0,
			screenEventHandler: ScreenEventHandler.Parent // ?
		})
		super.statelessSetup()
	}

	statefulSetup() {
		this.add(this.background)
		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight
		})
		this.view['mobject'] = this
		let paper = getPaper()
		if (paper !== null) {
			paper.sidebar = this
			this.background.update({
				fillColor: paper.background.fillColor
			})
		}
		// initialize with the buttons it needs itself
		// (updated later to accomodate sidebar wishes of
		// expandable submobs)
		this.initialize(this.buttonNames())
		super.statefulSetup()
		this.requestInit() // bc only it knows the initial buttons
	}

	addButton(button: SidebarButton) {
		let i = this.buttons.length
		this.add(button)
		this.buttons.push(button)
		button.update({
			midpoint: buttonCenter(i),
			lcoationIndex: i
		})
	}

	clear() {
		for (let button of Object.values(this.buttons)) {
			this.remove(button)
			this.buttons.pop()
		}
	}

	createButton(buttonName: string): SidebarButton | null {
		for (let buttonClass of this.availableButtonClasses) {
			if (buttonClass.name == buttonName) {
				return new buttonClass()
			}
		}
		return null
	}

	initialize(names: Array<string>) {
		this.clear()
		for (let i = 0; i < names.length; i++) {
			let button = this.createButton(names[i])
			button.update({
				locationIndex: i,
				key: (i + 1).toString()
			})
			this.addButton(button)
		}
	}

	requestInit() {
		let message = {'init': 'sidebar'}
		try {
			(window as Window).webkit.messageHandlers.handleMessageFromSidebar.postMessage(message)
		} catch {
			getPaper().getMessage(message)
		}
	}


	buttonForKey(key: string): SidebarButton | null {
		for (let b of this.buttons) {
			if (b.key == key) { return b }
		}
		return null
	}

	buttonNames(): Array<string> {
		let ret: Array<string> = []
		for (let b of this.buttons) {
			ret.push(b.constructor.name)
		}
		return ret
	}

	handleMessage(key: string, value: any) {
		switch (key) {
		case 'init':
			this.initialize(value)
			break
		case 'buttonDown':
			if (this.activeButton === null || this.activeButton === undefined) {
				this.activeButton = this.buttonForKey(value)
			}
			if (this.activeButton !== null) {
				this.activeButton.buttonDownByKey(value)
			}
			break
		case 'buttonUp':
			if (this.activeButton !== null && this.activeButton !== undefined) {
				this.activeButton.buttonUpByKey(value)
				if (this.activeButton.key == value) {
					this.activeButton = null
				}
			}
			break
		}
	}

	getMessage(message: object) {
		let key: string = Object.keys(message)[0]
		let value: string = Object.values(message)[0]
		let convertedValue: string | number | boolean | Array<string> = value
		if (value == "true") { convertedValue = true }
		if (value == "false") { convertedValue = false }
		if (value[0] == "(") {
			convertedValue = convertStringToArray(value)
		}
		this.handleMessage(key, convertedValue)
	}

}

let creating: boolean = false