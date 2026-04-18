
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { vertex, vertexTranslatedBy, vertexSubtract, vertexMultiply } from 'core/functions/vertex'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { buttonCenter, BUTTON_RADIUS, BUTTON_SCALE_FACTOR, OPTION_SPACING } from './button_geometry'
import { MAX_TAP_DELAY } from 'core/constants'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Paper } from 'core/Paper'
import { eventVertex, ScreenEvent, separateSidebar } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'
import { ImageView } from 'core/mobjects/ImageView'
import { Transform } from 'core/classes/Transform'
import { Sidebar } from 'core/Sidebar'
import { SidebarButtonView } from './SidebarButtonView'
import { SIDEBAR_WIDTH } from 'core/constants'
import { Polygon } from 'core/vmobjects/Polygon'
import { Pill } from 'core/shapes/Pill'

interface Window { webkit?: any }

export const buttonDict: object = {}

export class SidebarButton extends Pill {
	
	declare view: SidebarButtonView
	currentModeIndex: number
	previousIndex: number
	baseColor: Color
	baseRadius: number
	bigLabelFontSize: number
	labelWidth: number
	labelHeight: number
	smallLabelFontSize: number
	activeScalingFactor: number
	
	locationIndex: number
	optionSpacing: number
	touchStartLocation?: vertex
	touchStartTime?: number
	active: boolean
	messageKey: string
	label: TextLabel
	icons: Array<ImageView>
	iconSize: number
	innerCircle: Circle

	touchDownMessages: Array<object>
	touchUpMessages: Array<object>
	key: string
	activeKeyboard: boolean
	paper?: Paper
	sidebar?: Sidebar | null

	defaults(): object {
		return {
			baseColor: Color.gray(0.4),
			baseRadius: BUTTON_RADIUS,
			smallLabelFontSize: 12,
			bigLabelFontSize: 12,
			activeScalingFactor: 1.2,
			optionSpacing: OPTION_SPACING,

			label: new TextLabel({
				verticalAlign: 'center',
				horizontalAlign: 'center'
			}),
			labelWidth: 85,
			labelHeight: 25,
			icons: [],
			iconSize: 40,

			innerCircle: new Circle({
				midpoint: [BUTTON_RADIUS, BUTTON_RADIUS],
				radius: 0.9 * BUTTON_RADIUS,
				fillOpacity: 1,
				fillColor: Color.gray(0.2),
				strokeWidth: 0
			}),

			touchDownMessages: [],
			touchUpMessages: [],

			strokeWidth: 0,
			screenEventHandler: ScreenEventHandler.Self,
			currentModeIndex: 0,
			previousIndex: 0,
			locationIndex: 0,
			active: false,
			messageKey: 'key',
			radius: BUTTON_RADIUS,
			width: 2 * BUTTON_RADIUS,
			frameWidth: 2 * BUTTON_RADIUS,
			frameHeight: 2 * BUTTON_RADIUS,
			fillOpacity: 1.0,
			activeKeyboard: true,

			paper: null,
			sidebar: null,
			view: new SidebarButtonView({
				radius: BUTTON_RADIUS
			}),

			touchStartLocation: null,
			touchStartTime: null
		}
	}

	mutabilities(): object {
		return {
			baseColor: 'in_subclass',
			bigLabelFontSize: 'never',
			smallLabelFontSize: 'never',
			optionSpacing: 'never',
			label: 'never',
			icon: 'on_init',
			activeScalingFactor: 'never',
			messages: 'on_update',
			outgoingMessage: 'on_update',
			messageKey: 'on_init'
		}
	}

	setup() {
		super.setup()
		buttonDict[this.constructor.name] = this.constructor
		this.sidebar?.add(this.label)
		this.add(this.innerCircle)
		this.label.view.hide()
		this.setupBaseIcon()
		this.setupOtherIcons()

		this.addDependency('midpoint', this.label, 'midpoint')
		//this.updateModeIndex(0)
		this.view.update({
			fillColor: this.baseColor
		})
		this.label.update({
			anchor: [10, this.anchor[1] - 38],
			frameWidth: this.labelWidth,
			frameHeight: this.labelHeight,
			backgroundColor: this.innerCircle.fillColor,
			borderColor: this.baseColor,
			borderWidth: 2,
			borderRadius: 7,
			drawShadow: false,
			text: this.messageKey,
			horizontalAlign: 'center',
			verticalAlign: 'center',
			fontSize: this.bigLabelFontSize
		})

		this.label.view.div.style.paddingLeft = `5px`
		this.label.view.div.style.paddingRight = `5px`

		this.updateLabel()
		if (!separateSidebar) {
			const paperDiv = document.querySelector('#paper_id')
			if (paperDiv !== null) {
				let paperView = paperDiv['view']
				if (paperView !== null) {
					this.paper = paperView['mobject'] as Paper
				}
			}
		}
	}

	baseIconName(): string {
		return this.messageKey.replaceAll(' ', '_')
	}

	setupBaseIcon() {
		let baseIcon = new ImageView({
				imageLocation: `../../assets/${this.baseIconName()}.png`,
				frameWidth: this.iconSize,
				frameHeight: this.iconSize
			})
		this.icons.push(baseIcon)
		this.view.add(baseIcon)
		// Center the icon inside the pill.
		baseIcon.update({
			anchor: [
				BUTTON_RADIUS - 0.5 * this.iconSize,
				BUTTON_RADIUS - 0.5 * this.iconSize
			]
		})
	}

	setupOtherIcons() {
		for (let i = 1; i < this.touchDownMessages.length; i++) {
			let iconName = this.imageNameForIndex(i).replaceAll(' ', '_')
			let icon = new ImageView({
				imageLocation: `../../assets/${iconName}.png`,
				frameWidth: this.iconSize,
				frameHeight: this.iconSize,
				anchor: [this.icons[0].anchor[0] + i * this.optionSpacing, this.icons[0].anchor[1]]
			})
			this.icons.push(icon)
		}
	}

	numberOfIndices(): number { return this.touchDownMessages.length }

	colorForIndex(i: number): Color {
		return this.baseColor
	}
	
	buttonDownByKey(key: string) {
		if (!this.activeKeyboard) { return }
		if (key == this.key) {
			this.commonButtonDown()
		} else if (key == 'ArrowRight' && this.active) {
			this.selectNextOption()
		} else if (key == 'ArrowLeft' && this.active) {
			this.selectPreviousOption()
		}
	}

	commonButtonDown() {
		//log('commonButtonDown')
		this.touchStartTime = Date.now()
		if (this.sidebar && this.sidebar.activeButton != this) {
			this.sidebar.setActiveButton(this)
			this.updateModeIndex(0, true)
			return
		}

		// this.frame.transform.update({
		// 	scale: this.activeScalingFactor
		// })
		// this.label.view.show()
		// if (this.active) {
		// 	this.redraw()
		// 	return
		// }
		// this.update({
		// 	active: true,
		// 	previousIndex: this.currentModeIndex,
		// })
		// this.label.update({
		// 	anchor: [10, this.anchor[1] - 38]
		// })
		// this.redraw()
		// this.updateLabel()
		// if (this.touchDownMessages.length == 0) { return }
		// this.messagePaper(this.touchDownMessages[0])
		// if (this.sidebar) {
		// 	this.sidebar.activeButton = this
		// 	this.sidebar.add(this.label)
		// }
		// this.updateHelpText()
		// this.paper.helpTextLabel.view.show()
	}

	updateHelpText() {
		this.paper.helpTextLabel.update({
			text: this.paper.helpTexts[this.messageKey]
		})
	}

	onPointerDown(e: ScreenEvent) {
		//log('onPointerDown')
		// this.touchStartLocation = eventVertex(e)
		this.commonButtonDown()
	}

	onPointerMove(e: ScreenEvent) {
		let dx = this.xShift(e)
		this.innerCircle.update({
			midpoint: [this.baseRadius + dx, this.baseRadius]
		})
		let i = this.selectedIndex(e)
		this.updateModeIndex(i, true)
		// let newWidth = 2 * BUTTON_RADIUS + dx
		// this.updateModeIndex(newIndex, true)
		// this.update({
		// 	width: newWidth
		// })
		// this.label.update({
		// 	anchor: [10 + dx, this.anchor[1] - 38]
		// })
		// this.innerCircle.update({
		// 	midpoint: [this.width - this.radius, BUTTON_RADIUS]
		// })
	}

	onPointerUp(e: ScreenEvent) {
		//log('onPointerUp')
		this.touchStartLocation = this.sensor.localEventVertex(e)
		//log(this.touchStartLocation)
		this.commonButtonUp()
	}
	
	buttonUpByKey(key) {
		if (!this.activeKeyboard) { return }
		if (key == this.key) {
			this.commonButtonUp()
		}
	}

	commonButtonUp() {
		//log('commonButtonUp')
		if (Date.now() - this.touchStartTime > MAX_TAP_DELAY) {
			//log('no tap')
			if (this.sidebar) {
				this.sidebar.setActiveButton(null)
				this.messagePaper({'create': 'draw'})
				this.hideOptions()
			}
			return
		}

		//log('tap')
		if (this.sidebar.activeButton != this) { return }
		let dx = this.touchStartLocation[0] - this.baseRadius + this.sidebar.frameWidth
		let i = Math.round(dx / this.optionSpacing)
		this.highlightOption(i)
		this.updateModeIndex(i, true)
		this.touchStartLocation = null
		this.touchStartTime = null

		// if (this.touchUpMessages.length == 1) {
		// 	this.messagePaper(this.touchUpMessages[0])
		// } else if (this.touchUpMessages.length > 1) {
		// 	this.messagePaper(this.touchUpMessages[this.currentModeIndex])
		// }
		// this.currentModeIndex = 0
		// let dx: number = this.currentModeIndex * this.optionSpacing
		// let newWidth = 2 * BUTTON_RADIUS + dx
		
		// this.update({
		// 	active: false,
		// 	fillColor: this.colorForIndex(this.currentModeIndex),
		// 	width: newWidth
		// })
		// this.innerCircle.update({
		// 	midpoint: [this.radius, this.radius]
		// })
		// this.frame.transform.update({
		// 	scale: 1
		// })
		// this.sidebar.update({
		// 	activeButton: null
		// })

		// this.redraw()
		// this.updateLabel()
		// this.label.view.hide()
	}

	// onTap(e: ScreenEvent) {
	// 	log('onTap')
	// 	if (this.sidebar.activeButton != this) { return }
	// 	let i = this.selectedIndex(e)
	// 	this.highlightOption(i)
	// 	this.updateModeIndex(i, true)
	// }

	selectedIndex(e: ScreenEvent): number {
		let dx = this.xShift(e)
		var newIndex: number = Math.round(dx / this.optionSpacing)
		return newIndex
	}

	xShift(e: ScreenEvent): number {
		let t: MouseEvent | Touch = null
		if (e instanceof MouseEvent) { t = e }
		else { t = e.changedTouches[0] }
		let p: vertex = this.sensor.localEventVertex(e)
		var dx: number = p[0] - this.baseRadius + this.sidebar.frameWidth
		dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.touchDownMessages.length - 1))
		return dx
	}

	highlightOption(i: number) {
		this.innerCircle.update({
			midpoint: [this.baseRadius + i * this.optionSpacing, this.baseRadius]
		})
	}
	
	messagePaper(message: object) {
		try {
			let w = window as Window
			w.webkit.messageHandlers.handleMessageFromSidebar.postMessage(message)
		} catch {
			//log(message)
			this.paper.getMessage(message)
		}
	}

	updateLabel() {
		let msg = this.touchDownMessages[this.currentModeIndex]
		let text = this.labelFromMessage(msg)
		this.label.update({
			text: text,
			fontSize: (text.length < 15) ? this.bigLabelFontSize : this.smallLabelFontSize
		})
	}

	imageNameForIndex(index: number): string {
		return (Object.keys(this.touchDownMessages[index] ?? {}) ?? ['key'])[0]
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.updateLabel()
		if (redraw) { this.view.redraw() }
	}
	
	updateModeIndex(newIndex: number, withMessage: any = {}) {
		//log('updateModeIndex')
		if ((newIndex !== 0 && newIndex === this.currentModeIndex) || newIndex < 0) {
			return
		}
		this.currentModeIndex = newIndex
		let message: object = this.touchDownMessages[this.currentModeIndex]
		if (withMessage as boolean) {
			this.messagePaper(message)
		}
 
		this.updateLabel()
	}
	
	selectNextOption() {
		if (this.currentModeIndex == this.touchDownMessages.length - 1) { return }
		this.updateModeIndex(this.currentModeIndex + 1, true)

	}
	
	selectPreviousOption() {
		if (this.currentModeIndex == 0) { return }
		this.updateModeIndex(this.currentModeIndex - 1, true)
	}

	labelFromMessage(msg: object): string {
		var key = Object.keys(msg)[0]
		return key
	}


	showOptions() {
		//log('showOptions')
		this.update({
			width: 2 * this.baseRadius + (this.icons.length - 1) * this.optionSpacing
		})
		for (let i = 1; i < this.icons.length; i++) {
			this.view.add(this.icons[i])
		}
	}
	
	hideOptions() {
		//log('hideOptions')
		this.update({
			width: 2 * this.baseRadius
		})
		for (let i = 1; i < this.icons.length; i++) {
			this.icons[i].div.remove()
		}
		this.highlightOption(0)
	}
	
}






























