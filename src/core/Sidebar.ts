
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { SIDEBAR_WIDTH, PAPER_HEIGHT } from 'core/constants'
import { convertStringToArray } from 'core/functions/arrays'
import { getPaper } from 'core/functions/getters'
import { Color } from 'core/classes/Color'
import { Rectangle } from 'core/shapes/Rectangle'
import { buttonCenter } from 'core/sidebar_buttons/button_geometry'
import { Paper } from 'core/Paper'
import { Mobject } from 'core/mobjects/Mobject'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { log } from 'core/functions/logging'
import { SidebarView } from './SidebarView'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'

// StartSidebar needs to be imported *somewhere* for TS to compile it
import { StartSidebar } from 'StartSidebar'

interface Window { webkit?: any }

export class Sidebar extends Mobject {

	declare view: SidebarView
	background: Rectangle
	availableButtonClasses: Array<any>
	buttons: Array<SidebarButton>
	activeButton: SidebarButton

	defaults(): object {
		return {
			view: new SidebarView(),
			background: new Rectangle({
				fillColor: Color.gray(0.1),
				fillOpacity: 1.0,
				strokeWidth: 0,
				screenEventHandler: ScreenEventHandler.Parent,
				width: SIDEBAR_WIDTH,
				height: PAPER_HEIGHT
			}),

			availableButtonClasses: [
				DragButton,
				LinkButton,
				NumberButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new NumberButton()
			],
			frameWidth: SIDEBAR_WIDTH,
			frameHeight: PAPER_HEIGHT,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			view: 'never',
			background: 'never'
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

		let height = window.innerHeight
		this.update({
			frameHeight: height
		})
		this.background.update({
			height: height
		})
	}

	addButton(button: SidebarButton) {
		let i = this.buttons.length
		this.add(button)
		this.buttons.push(button)
		button.update({
			midpoint: buttonCenter(i),
			locationIndex: i
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
		throw `Button class ${buttonName} not available!`
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
