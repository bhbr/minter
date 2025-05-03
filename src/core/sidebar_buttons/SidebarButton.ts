
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { vertex, vertexTranslatedBy } from 'core/functions/vertex'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { buttonCenter, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Paper } from 'core/Paper'
import { eventVertex, ScreenEvent, isTouchDevice } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'


interface Window { webkit?: any }

export const buttonDict: object = {}

export class SidebarButton extends Circle {
	
	currentModeIndex: number
	previousIndex: number
	baseColor: Color
	baseRadius: number
	baseFontSize: number
	activeScalingFactor: number
	
	locationIndex: number
	optionSpacing: number
	touchStart: vertex
	active: boolean
	showLabel: boolean
	text: string
	label: TextLabel
	messages: Array<object>
	outgoingMessage: object
	key: string
	activeKeyboard: boolean
	paper?: Paper

	defaults(): object {
		return {
			baseColor: Color.gray(0.4),
			baseRadius: BUTTON_RADIUS,
			baseFontSize: 12,
			activeScalingFactor: 1.2,
			optionSpacing: 25,

			label: new TextLabel(),
			messages: [],
			outgoingMessage: {},

			strokeWidth: 0,
			screenEventHandler: ScreenEventHandler.Self,
			currentModeIndex: 0,
			previousIndex: 0,
			locationIndex: 0,
			active: false,
			showLabel: true,
			text: 'text',
			radius: BUTTON_RADIUS,
			frameWidth: 2 * BUTTON_RADIUS,
			frameHeight: 2 * BUTTON_RADIUS,
			fillOpacity: 0.5,
			activeKeyboard: true,

			paper: null
		}
	}

	mutabilities(): object {
		return {
			baseColor: 'in_subclass',
			optionSpacing: 'never',
			label: 'never',
			activeScalingFactor: 'never',
			messages: 'on_init'
		}
	}

	setup() {
		super.setup()
		buttonDict[this.constructor.name] = this.constructor
		this.add(this.label)
		this.addDependency('midpoint', this.label, 'midpoint')
		this.updateModeIndex(0)
		this.view.update({
			fillColor: this.baseColor
		})
		this.label.update({
			frameWidth: 2 * this.baseRadius,
			frameHeight: 2 * this.baseRadius,
			text: this.text
		}, false)
		this.label.view.div.style['font-size'] = `${this.baseFontSize}px`
		this.label.view.div.style['color'] = Color.white().toHex()

		if (isTouchDevice === false) {
			const paperDiv = document.querySelector('#paper_id')
			if (paperDiv !== null) {
				let paperView = paperDiv['view']
				if (paperView !== null) {
					this.paper = paperView['mobject'] as Paper
				}
			}
		}
	}

	numberOfIndices(): number { return this.messages.length }

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
		this.messagePaper(this.messages[0])
		this.update({
			active: true,
			radius: this.baseRadius * this.activeScalingFactor,
			previousIndex: this.currentModeIndex
		})
		this.label.view.div.style.setProperty('font-size', `${this.baseFontSize * this.activeScalingFactor}px`)
		this.label.update({
			frameWidth: 2 * this.radius,
			frameHeight: 2 * this.radius			
		})
		this.updateLabel()
	}

	onPointerDown(e: ScreenEvent) {
		this.commonButtonDown()
		this.touchStart = eventVertex(e)
	}

	onPointerMove(e: ScreenEvent) {
	
		let t: MouseEvent | Touch = null
		if (e instanceof MouseEvent) { t = e }
		else { t = e.changedTouches[0] }

		let p: vertex = eventVertex(e)
		var dx: number = p[0] - this.touchStart[0]

		var newIndex: number = Math.floor(this.previousIndex + dx / this.optionSpacing)
		newIndex = Math.min(Math.max(newIndex, 0), this.messages.length - 1)
		dx += this.previousIndex * this.optionSpacing
		dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1))

		let newMidpoint = [buttonCenter(this.locationIndex)[0] + dx, buttonCenter(this.locationIndex)[1]]
		
		this.updateModeIndex(newIndex, true)
		this.update({ midpoint: newMidpoint })
	}

	onPointerUp(e: ScreenEvent) {
		this.commonButtonUp()
	}

	onPointerOut(e: ScreenEvent) {
		this.commonButtonUp()
	}
	
	buttonUpByKey(key) {
		if (!this.activeKeyboard) { return }
		if (key == this.key) {
			this.commonButtonUp()
		}
	}

	commonButtonUp() {
		this.currentModeIndex = 0
		let dx: number = this.currentModeIndex * this.optionSpacing
		let newMidpoint = [buttonCenter(this.locationIndex)[0] + dx, buttonCenter(this.locationIndex)[1]]
		
		this.update({
			active: false,
			fillColor: this.colorForIndex(this.currentModeIndex),
			midpoint: newMidpoint,
			radius: this.baseRadius,
			fontSize: this.baseFontSize
		})
		this.label.view.div.style.setProperty('font-size', `${this.baseFontSize}px`)
		this.label.update({
			frameWidth: 2 * this.radius,
			frameHeight: 2 * this.radius			
		})
		this.updateLabel()
		this.messagePaper(this.outgoingMessage)
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
		if (this.label == undefined) { return }
		this.label.update({
			frameWidth: 2 * this.radius,
			frameHeight: 2 * this.radius
		})

		let f = this.active ? BUTTON_SCALE_FACTOR : 1
		let fs = f * (this.baseFontSize ?? 12)
		this.label.view?.div.style.setProperty('font-size', fs.toString())
		if (this.showLabel) {
			try {
				let msg = this.messages[this.currentModeIndex]
				this.label.update({
					text: this.labelFromMessage(msg)
				})
			} catch { }
		} else {
			this.label.text = ''
		}
	}

	labelFromMessage(msg: object): string {
		return Object.keys(msg)[0]
	}

	update(args: object = {}, redraw: boolean = true) {
		//args['midpoint'] = buttonCenter(this.locationIndex)
		super.update(args, false)
		this.updateLabel()
		if (redraw) { this.view.redraw() }
	}
	
	updateModeIndex(newIndex: number, withMessage: any = {}) {
		if (newIndex == this.currentModeIndex || newIndex == -1) {
			return
		}
		this.currentModeIndex = newIndex
		let message: object = this.messages[this.currentModeIndex]
		this.update({
			fillColor: this.colorForIndex(this.currentModeIndex)
		})
		if (withMessage as boolean) { this.messagePaper(message) }
 
		this.updateLabel()
	}
	
	selectNextOption() {
		if (this.currentModeIndex == this.messages.length - 1) { return }
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






























