import { ScreenEventHandler } from 'core/mobject/screen_events'
import { rgb, gray } from 'core/helpers/rgb'
import { TAU } from 'core/helpers/math'
import { Vertex } from 'core/helpers/Vertex'
import { Transform } from 'core/helpers/Transform'
import { convertStringToArray } from 'core/helpers/helpers'
import { Color, COLOR_PALETTE } from 'core/helpers/Color'
import { Rectangle } from 'base_extensions/mobjects/shapes/Rectangle'
import { buttonCenter, BUTTON_CENTER_X, BUTTON_CENTER_Y, BUTTON_SPACING, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './buttons/button_geometry'
import { buttonFactory } from './buttons/button_factory'
import { SidebarButton } from './buttons/SidebarButton'
import { CreativeButton } from './buttons/CreativeButton'
import { DragButton } from './buttons/DragButton'
import { LinkButton } from './buttons/LinkButton'
import { ColorChangeButton } from './buttons/ColorChangeButton'
import { ColorSampleButton } from 'base_extensions/created_mobjects/ColorSample/ColorSampleButton'
import { Paper } from 'core/Paper'
import { Mobject } from 'core/mobject/Mobject'

let paperButtons: Array<string> = ['DragButton', 'LinkButton', 'ExpandableButton', 'NumberButton', 'ArithmeticButton', 'WavyButton', 'SwingButton', 'ColorSampleButton']

export class Sidebar extends Mobject {

	background: Rectangle
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
			buttons: []
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
		let paperView = document.querySelector('#paper_id')
		if (paperView !== null) {
			let paper = paperView['mobject']
			paper.sidebar = this
			this.background.update({
				fillColor: paper.background.fillColor
			})
		}
		this.handleMessage('init', paperButtons)
		super.statefulSetup()
	}

	addButton(button: SidebarButton) {
		let i = this.buttons.length
		this.add(button)
		this.buttons.push(button)
		button.update({
			midpoint: buttonCenter(i)
		})
	}

	clear() {
		for (let button of Object.values(this.buttons)) {
			this.remove(button)
			this.buttons.pop()
		}
	}

	initialize(value) {
		this.clear()
		for (let i = 0; i < value.length; i++) {
			let button = buttonFactory(value[i], i)
			this.addButton(button)
		}
	}

	buttonForKey(key: string): SidebarButton | null {
		for (let b of this.buttons) {
			if (b.key == key) { return b }
		}
		return null
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

let sidebarDiv = document.querySelector('#sidebar_id') as HTMLElement
export const sidebar = new Sidebar({
	view: sidebarDiv
})



let creating: boolean = false
