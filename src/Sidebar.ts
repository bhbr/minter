
import { ScreenEventHandler } from 'mobjects/screen_events.js'
import { SIDEBAR_WIDTH } from 'constants.js'
import { convertStringToArray } from '@bhbr/betray'
import { getPaper } from 'functions/getters.js'
import { Color } from 'classes/Color.js'
import { Rectangle } from 'shapes/Rectangle.js'
import { buttonAnchor } from 'sidebar_buttons/button_geometry.js'
import { Paper } from 'Paper.js'
import { Mobject } from 'mobjects/Mobject.js'
import { SidebarButton } from 'sidebar_buttons/SidebarButton.js'
import { DragButton } from 'sidebar_buttons/DragButton.js'
import { LinkButton } from 'sidebar_buttons/LinkButton.js'
import { ControlsButton } from 'sidebar_buttons/ControlsButton.js'
import { EraseButton } from 'sidebar_buttons/EraseButton.js'
import { log } from 'functions/logging.js'
import { SidebarView } from './SidebarView.js'
import { ScreenEvent, isTouchDevice, separateSidebar } from 'mobjects/screen_events.js'

// TestSidebar needs to be imported *somewhere* for TS to compile it
//import { TestSidebar } from './extensions/boards/demo/DemoSidebar.js'

interface Window { webkit?: any }

export class Sidebar extends Mobject {

	declare view: SidebarView
	background: Rectangle
	availableButtonClasses: Array<any>
	buttons: Array<SidebarButton>
	activeButton?: SidebarButton
	defaultKeys: Array<string>

	defaults(): object {
		return {
			view: new SidebarView(),
			activeButton: null,
			background: new Rectangle({
				fillColor: Color.black(),
				fillOpacity: 1.0,
				strokeWidth: 0,
				screenEventHandler: ScreenEventHandler.Parent,
				width: SIDEBAR_WIDTH,
				height: Math.max(window.screen.width, window.screen.height) + 500
			}),
			availableButtonClasses: [
				DragButton,
				LinkButton,
				ControlsButton,
				EraseButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new ControlsButton(),
				new EraseButton()
			],
			frameWidth: SIDEBAR_WIDTH,
			frameHeight: Math.max(window.screen.width, window.screen.height) + 500,
			screenEventHandler: ScreenEventHandler.Self,
			defaultKeys: '1 2 3 4 5 6 7 8 9 0 q w e r t z u i o p'.split(' ')
		}
	}

	mutabilities(): object {
		return {
			view: 'in_subclass',
			background: 'in_subclass'
		}
	}

	setup() {
		this.add(this.background)
		this.view.mobject = this
		let maybePaper = getPaper()
		if (maybePaper != undefined) {
			let paper = maybePaper as Paper
			paper.sidebar = this
			this.background.update({
				fillColor: paper.background.view.fillColor
			})
		}
		// initialize with the buttons it needs itself
		// (updated later to accomodate sidebar wishes of
		// expandable submobs)
		this.initialize(this.buttonNames())
		super.setup()
		this.requestInit() // bc only it knows the initial buttons

		this.addDependency('frameWidth', this.background, 'width')
		this.addDependency('frameHeight', this.background, 'height')

		// if (isTouchDevice) {
		// 	if (separateSidebar) {
		// 		this.view.div.style.background = 'clear'
		// 		this.view.div.style.backgroundColor = 'clear'
		// 		this.background.update({
		// 			fillColor: Color.clear()
		// 		})
		// 	} else {
		// 		document.body.style.backgroundColor = 'black'
		// 	}
		// }
	}

	addButton(button: SidebarButton) {
		let i = this.buttons.length
		this.add(button)
		this.buttons.push(button)
		button.update({
//			midpoint: buttonCenter(i),
			anchor: buttonAnchor(i),
			locationIndex: i
		})
	}

	setActiveButton(newButton: SidebarButton | null) {
		if (this.activeButton) {
			this.activeButton.hideOptions()
			this.activeButton.label.view.hide()
		}
		this.activeButton = newButton
		if (newButton) {
			newButton.showOptions()
			this.activeButton.label.view.show()
		}
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
				let b = new buttonClass()
				b.sidebar = this
				return b
			}
		}
		throw `Button class ${buttonName} not available!`
		return null
	}

	initialize(names: Array<string>) {
		this.clear()
		for (let i = 0; i < names.length; i++) {
			let button = this.createButton(names[i])
			button.update({
				locationIndex: i,
				shortcutKey: this.defaultKeys[i]
			})
			this.addButton(button)
		}
		for (let i = 0; i < names.length; i++) {
			let label = this.buttons[i].label
			this.add(label)
			label.view.hide()
			label.update({
				anchor: [10, this.buttons[i].anchor[1] - 38]
			})
		}
	}

	requestInit() {
		let message = { init: 'sidebar' }
		try {
			let w = window as Window
			w.webkit.messageHandlers.handleMessageFromSidebar.postMessage(message)
		} catch {
			let maybePaper = getPaper()
			if (maybePaper != undefined) {
				let paper = maybePaper as Paper
				paper.getMessage(message)
			}
		}
	}


	buttonForKey(key: string): SidebarButton | null {
		for (let b of this.buttons) {
			if (b.getID() == key || b.shortcutKey == key) { return b }
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
			let pressedButton = this.buttonForKey(value) ?? null
			if (pressedButton !== this.activeButton && pressedButton !== null) {
				this.setActiveButton(pressedButton)
			}
			if (this.activeButton !== null) {
				this.activeButton.buttonDownByKey(value)
			}
			break
		case 'buttonUp':
			let pressedButton2 = this.buttonForKey(value) ?? null
			if (pressedButton2 !== this.activeButton && pressedButton2 !== null) {
				this.setActiveButton(pressedButton2)
			}
			if (this.activeButton !== null) {
				this.activeButton.buttonUpByKey(value)
			}
			break
		case 'button':
			if (value == 'collapse') {
				this.setActiveButton(null)
			}
			break
		default:
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

	onTap(e: ScreenEvent) {
		if (!this.activeButton) { return }
		this.activeButton.commonButtonUp()
	}

}

let creating: boolean = false
