
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

interface Window { webkit?: any }

export const buttonDict: object = {}

export class SidebarButton extends Circle {
	
	declare view: SidebarButtonView
	currentModeIndex: number
	previousIndex: number
	baseColor: Color
	baseRadius: number
	labelFontSize: number
	activeScalingFactor: number
	
	locationIndex: number
	optionSpacing: number
	touchStart: vertex
	active: boolean
	messageKey: string
	label: TextLabel
	icon?: ImageView

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
			labelFontSize: 16,
			activeScalingFactor: 1.2,
			optionSpacing: OPTION_SPACING,

			label: new TextLabel(),
			sideLabel: new TextLabel(),
			icon: null,
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
			frameWidth: 2 * BUTTON_RADIUS,
			frameHeight: 2 * BUTTON_RADIUS,
			fillOpacity: 0.5,
			activeKeyboard: true,

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
			labelFontSize: 'never',
			optionSpacing: 'never',
			label: 'never',
			sideLabel: 'never',
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
		this.add(this.label)
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
			anchor: [2.5 * this.baseRadius, 0],
			frameWidth: 150,
			frameHeight: 2 * this.baseRadius,
			text: this.messageKey,
			horizontalAlign: 'left',
			verticalAlign: 'center',
			fontSize: this.labelFontSize
		})
		this.updateLabel()
		this.updateSideLabel()
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
		if (this.active) { return }
		this.update({
			active: true,
			previousIndex: this.currentModeIndex,
		})
		this.frame.transform.update({
			scale: this.activeScalingFactor
		})
		this.redraw()
		this.label.view.show()
		this.updateIcon()
		if (this.touchDownMessages.length == 0) { return }
		this.messagePaper(this.touchDownMessages[0])
		if (this.sidebar) {
			this.sidebar.activeButton = this
		}
	}

	onPointerDown(e: ScreenEvent) {
		log('down')
		this.commonButtonDown()
		this.touchStart = eventVertex(e)
	}

	onPointerMove(e: ScreenEvent) {
		log('move')
		let t: MouseEvent | Touch = null
		if (e instanceof MouseEvent) { t = e }
		else { t = e.changedTouches[0] }

		let p: vertex = eventVertex(e)
		var dx: number = p[0] - this.touchStart[0]

		var newIndex: number = Math.floor(this.previousIndex + dx / this.optionSpacing)
		newIndex = Math.min(Math.max(newIndex, 0), this.touchDownMessages.length - 1)
		dx += this.previousIndex * this.optionSpacing
		dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.touchDownMessages.length - 1))

		let newMidpoint = [buttonCenter(this.locationIndex)[0] + dx, buttonCenter(this.locationIndex)[1]]
		
		this.updateModeIndex(newIndex, true)
		this.update({ midpoint: newMidpoint })

	}

	onPointerUp(e: ScreenEvent) {
		log('up')
		this.commonButtonUp()
	}

	onPointerCancel(e: ScreenEvent) {
		log('cancel')
		this.commonButtonUp()
	}
	
	buttonUpByKey(key) {
		if (!this.activeKeyboard) { return }
		if (key == this.key) {
			this.commonButtonUp()
		}
	}

	commonButtonUp() {
		this.label.view.hide()
		if (this.touchUpMessages.length == 1) {
			this.messagePaper(this.touchUpMessages[0])
		} else if (this.touchUpMessages.length > 1) {
			this.messagePaper(this.touchUpMessages[this.currentModeIndex])
		}

		this.currentModeIndex = 0
		let dx: number = this.currentModeIndex * this.optionSpacing
		let newMidpoint = [buttonCenter(this.locationIndex)[0] + dx, buttonCenter(this.locationIndex)[1]]
		
		this.update({
			active: false,
			fillColor: this.colorForIndex(this.currentModeIndex),
			midpoint: newMidpoint
		})
		this.frame.transform.update({
			scale: 1
		})
		this.redraw()
		this.updateLabel()
		this.updateIcon()
		
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
		this.label.update({
			text: this.labelFromMessage(msg)
		})
	}

	updateIcon() {
		if (this.icon === undefined || this.icon === null) { return }
		let name = this.imageNameForIndex(this.currentModeIndex).replaceAll(' ', '_')
		this.icon.update({
			imageLocation: `../../assets/${name}.png`,
			anchor: [
				0.5 * (this.frameWidth - this.icon.frameWidth),
				0.5 * (this.frameHeight - this.icon.frameHeight)
			]
		})
	}

	imageNameForIndex(index: number): string {
		return (Object.keys(this.touchDownMessages[index] ?? {}) ?? ['key'])[0]
	}

	labelFromMessage(msg: object): string {
		return Object.keys(msg)[0]
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.updateLabel()
		this.updateSideLabel()
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
		this.updateSideLabel()
		this.updateIcon()
	}

	updateSideLabel() {
		this.sideLabel.update({
			text: this.messageKey
		})
	}
	
	selectNextOption() {
		if (this.currentModeIndex == this.touchDownMessages.length - 1) { return }
		this.update({
			midpoint: vertexTranslatedBy(this.midpoint, [this.optionSpacing, 0])
		})
		this.updateModeIndex(this.currentModeIndex + 1, true)
	}
	
	selectPreviousOption() {
		if (this.currentModeIndex == 0) { return }
		this.update({
			midpoint: vertexTranslatedBy(this.midpoint, [-this.optionSpacing, 0])
		})
		this.updateModeIndex(this.currentModeIndex - 1, true)
	}
	
	
	
}






























