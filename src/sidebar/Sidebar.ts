import { eventVertex, isTouchDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, ScreenEvent, ScreenEventHandler } from '../modules/mobject/screen_events'
import { rgb, gray } from '../modules/helpers/rgb'
import { TAU } from '../modules/helpers/math'
import { Vertex } from '../modules/helpers/Vertex'
import { Transform } from '../modules/helpers/Transform'
import { log, convertStringToArray, convertArrayToString } from '../modules/helpers/helpers'
import { Mobject } from '../modules/mobject/Mobject'
import { ExpandableMobject } from '../modules/mobject/expandable/ExpandableMobject'
import { MGroup } from '../modules/mobject/MGroup'
import { TextLabel } from '../modules/TextLabel'
import { Color, COLOR_PALETTE } from '../modules/helpers/Color'
import { Circle } from '../modules/shapes/Circle'
import { Rectangle } from '../modules/shapes/Rectangle'
import { Segment } from '../modules/arrows/Segment'
import { buttonCenter, BUTTON_CENTER_X, BUTTON_CENTER_Y, BUTTON_SPACING, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry'
import { buttonFactory } from './button_factory'
import { SidebarButton } from './SidebarButton'
import { CreativeButton } from './CreativeButton'
import { DragButton } from './DragButton'
import { LinkButton } from './LinkButton'
import { ColorChangeButton } from './ColorChangeButton'
import { Paper } from '../Paper'

let paperButtons: Array<string> = ['DragButton', 'LinkButton', 'ExpandableButton', 'SliderButton', 'CindyButton', 'PendulumButton']

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
		button.update({ midpoint: buttonCenter(i) })
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


//paper.view.style.left = sidebar.viewWidth.toString() + "px"

// let lineButton = new CreativeButton({
// 	creations: ['segment', 'ray', 'line'],
// 	key: 'q',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 0
// })
// sidebar.addButton(lineButton)
// lineButton.update({
// 	midpoint: buttonCenter(0)
// })

// let circleButton = new CreativeButton({
// 	creations: ['circle'],
// 	key: 'w',
// 	baseColor: Color.gray(0.4),
// 	locationIndex: 1
// })
// sidebar.addButton(circleButton)
// circleButton.update({
// 	midpoint: buttonCenter(1)
// })





// let sliderButton = new CreativeButton({
// 	creations: ['slider'],
// 	key: 'e',
// 	baseColor: Color.gray(0.6),
// 	locationIndex: 2
// })
// sidebar.addButton(sliderButton)
// sliderButton.update({
// 	midpoint: buttonCenter(2)
// })

// let cindyButton = new CreativeButton({
// 	creations: ['cindy'],
// 	key: 'r',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 3
// })
// sidebar.addButton(cindyButton)
// cindyButton.update({
// 	midpoint: buttonCenter(3)
// })
  
// let pendulumButton = new CreativeButton({
// 	creations: ['pendulum'],
// 	key: 't',
// 	baseColor: Color.gray(0.4),
// 	locationIndex: 4
// })
// sidebar.addButton(pendulumButton)
// pendulumButton.update({
// 	midpoint: buttonCenter(4)
// })





  
// let dragButton = new DragButton({
// 	messages: [{drag: true}],
// 	outgoingMessage: {drag: false},
// 	key: 'a',
// 	baseColor: Color.gray(0.6),
// 	locationIndex: 5
// })
// dragButton.label.view.setAttribute('fill', 'black')
// sidebar.addButton(dragButton)
// dragButton.update({
// 	midpoint: buttonCenter(5)
// })






// let linkButton = new LinkButton({
// 	messages: [{toggleLinks: true}],
// 	outgoingMessage: {toggleLinks: false},
// 	key: 's',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 6
// })
// sidebar.addButton(linkButton)
// linkButton.update({
// 	midpoint: buttonCenter(6)
// })

// let colorButton = new ColorChangeButton({
// 	key: 'd',
// 	baseColor: Color.white(),
// 	modeSpacing: 15,
// 	locationIndex: 7,
// 	fillOpacity: 1
// })
// sidebar.addButton(colorButton)
// colorButton.update({
// 	midpoint: buttonCenter(7)
// })


let creating: boolean = false
