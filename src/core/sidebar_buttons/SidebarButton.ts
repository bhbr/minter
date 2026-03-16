
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { vertex, vertexTranslatedBy, vertexSubtract, vertexMultiply } from 'core/functions/vertex'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { buttonCenter, BUTTON_RADIUS, BUTTON_SCALE_FACTOR, OPTION_SPACING } from './button_geometry'
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
	touchStart: vertex
	active: boolean
	messageKey: string
	label: TextLabel
	icon?: ImageView
	innerCircle: Circle

	dragArrow: Polygon

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
			icon: null,

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

			dragArrow: new Polygon({
				anchor: [2 * BUTTON_RADIUS, BUTTON_RADIUS],
				vertices: [
					[10, -0.3 * BUTTON_RADIUS],
					[10 + 0.3 * BUTTON_RADIUS, 0],
					[10, 0.3 * BUTTON_RADIUS]
				],
				fillOpacity: 1,
				strokeWidth: 0
			}),

			paper: null,
			sidebar: null,
			view: new SidebarButtonView({
				radius: BUTTON_RADIUS
			})
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
		if (this.icon) {
			this.updateIcon()
			this.view.add(this.icon)
		}
		this.addDependency('midpoint', this.label, 'midpoint')
		this.updateModeIndex(0)
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

		this.dragArrow.update({
			fillColor: this.fillColor
		})

		this.updateLabel()
		this.add(this.dragArrow)
		this.dragArrow.view.hide()
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
		this.frame.transform.update({
			scale: this.activeScalingFactor
		})
		this.label.view.show()
		if (this.active) {
			this.redraw()
			return
		}
		this.update({
			active: true,
			previousIndex: this.currentModeIndex,
		})
		this.label.update({
			anchor: [10, this.anchor[1] - 38]
		})
		this.redraw()
		this.updateIcon()
		this.updateLabel()
		if (this.touchDownMessages.length == 0) { return }
		this.messagePaper(this.touchDownMessages[0])
		if (this.sidebar) {
			this.sidebar.activeButton = this
			this.sidebar.add(this.label)
		}
		this.updateHelpText()
		this.paper.helpTextLabel.view.show()
		this.dragArrow.update({
			anchor: [this.width, this.radius]
		})
		this.dragArrow.view.show()
	}

	updateHelpText() {
		this.paper.helpTextLabel.update({
			text: this.paper.helpTexts[this.messageKey]
		})
	}

	onPointerDown(e: ScreenEvent) {
		//log('setting touchStart:')
		this.touchStart = eventVertex(e)
		this.commonButtonDown()
	}

	onPointerMove(e: ScreenEvent) {
		if (!this.sidebar.activeButton) { return }
		let t: MouseEvent | Touch = null
		if (e instanceof MouseEvent) { t = e }
		else { t = e.changedTouches[0] }
		let p: vertex = eventVertex(e)
		var dx: number = p[0] - this.touchStart[0]
		var newIndex: number = Math.floor(this.previousIndex + dx / this.optionSpacing)
		newIndex = Math.min(Math.max(newIndex, 0), this.touchDownMessages.length - 1)
		dx += this.previousIndex * this.optionSpacing
		dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.touchDownMessages.length - 1))

		let newWidth = 2 * BUTTON_RADIUS + dx
		this.updateModeIndex(newIndex, true)
		this.update({
			width: newWidth
		})
		this.dragArrow.update({
			anchor: [this.width, this.radius]
		})
		if (this.currentModeIndex == this.touchDownMessages.length - 1) {
			this.dragArrow.view.hide()
		} else {
			this.dragArrow.view.show()
		}
		this.label.update({
			anchor: [10 + dx, this.anchor[1] - 38]
		})
		this.icon.update({
			anchor: [this.width - this.radius - 0.5 * this.icon.frameWidth, this.radius - 0.5 * this.icon.frameHeight]
		})
		this.innerCircle.update({
			midpoint: [this.width - this.radius, BUTTON_RADIUS]
		})
	}

	onPointerUp(e: ScreenEvent) {
		this.commonButtonUp()
	}
	
	buttonUpByKey(key) {
		if (!this.activeKeyboard) { return }
		if (key == this.key) {
			this.commonButtonUp()
		}
	}

	commonButtonUp() {
		if (this.touchUpMessages.length == 1) {
			this.messagePaper(this.touchUpMessages[0])
		} else if (this.touchUpMessages.length > 1) {
			this.messagePaper(this.touchUpMessages[this.currentModeIndex])
		}
		this.currentModeIndex = 0
		let dx: number = this.currentModeIndex * this.optionSpacing
		let newWidth = 2 * BUTTON_RADIUS + dx
		
		this.update({
			active: false,
			fillColor: this.colorForIndex(this.currentModeIndex),
			width: newWidth
		})
		this.innerCircle.update({
			midpoint: [this.radius, this.radius]
		})
		this.frame.transform.update({
			scale: 1
		})
		this.sidebar.update({
			activeButton: null
		})

		this.redraw()
		this.updateLabel()
		this.updateIcon()
		this.label.view.hide()
		this.dragArrow.update({
			anchor: [this.width, this.radius]
		})
		this.dragArrow.view.hide()
	}
	
	messagePaper(message: object) {
		try {
			let w = window as Window
			w.webkit.messageHandlers.handleMessageFromSidebar.postMessage(message)
		} catch {
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

	updateIcon() {
		if (this.icon === undefined || this.icon === null) { return }
		let name = this.imageNameForIndex(this.currentModeIndex).replaceAll(' ', '_')
		this.icon.update({
			imageLocation: `../../assets/${name}.png`,
			anchor: [
				0.5 * (this.frameWidth - this.icon.frameWidth) + this.optionSpacing * this.currentModeIndex,
				0.5 * (this.frameHeight - this.icon.frameHeight)
			]
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
		if (newIndex == this.currentModeIndex || newIndex == -1) {
			return
		}
		this.currentModeIndex = newIndex
		let message: object = this.touchDownMessages[this.currentModeIndex]
		this.update({
			fillColor: this.colorForIndex(this.currentModeIndex)
		})
		if (withMessage as boolean) {
			this.messagePaper(message)
		}
 
		this.updateLabel()
		this.updateIcon()
		this.update({
			width: this.optionSpacing * this.currentModeIndex + 2 * BUTTON_RADIUS
		})
		this.dragArrow.update({
			anchor: [this.width, this.radius]
		})
		this.innerCircle.update({
			midpoint: [this.width - this.radius, this.radius]
		})
		if (this.currentModeIndex == this.touchDownMessages.length - 1) {
			this.dragArrow.view.hide()
		} else {
			this.dragArrow.view.show()
		}
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
	
}






























