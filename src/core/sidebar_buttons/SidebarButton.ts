
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { buttonCenter, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Paper } from 'core/Paper'
import { eventVertex, ScreenEvent, isTouchDevice } from 'core/mobjects/screen_events'

var paper: Paper = null

if (isTouchDevice === false) {
	const paperView = document.querySelector('#paper_id')
	if (paperView !== null) {
		paper = paperView['mobject'] as Paper
	}
}

interface Window { webkit?: any }

export const buttonDict: object = {}

export class SidebarButton extends Circle {
	
	currentModeIndex: number
	previousIndex: number
	baseColor: Color
	locationIndex: number
	optionSpacing: number
	touchStart: Vertex
	active: boolean
	activeScalingFactor: number
	showLabel: boolean
	text: string
	label: TextLabel
	fontSize: number
	messages: Array<object>
	outgoingMessage: object
	key: string
	activeKeyboard: boolean

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'baseColor',
			'optionSpacing',
			'label',
			'messages',
			'activeScalingFactor'
		])
	}


	defaults(): object {
		return Object.assign(super.defaults(), {
			strokeWidth: 0,
			optionSpacing: 25,
			screenEventHandler: ScreenEventHandler.Self,
			label: new TextLabel(),
			currentModeIndex: 0,
			previousIndex: 0,
			baseColor: Color.gray(0.4),
			locationIndex: 0,
			active: false,
			activeScalingFactor: 1.2,
			showLabel: true,
			text: 'text',
			fontSize: 12,
			messages: [],
			radius: BUTTON_RADIUS,
			viewWidth: 2 * BUTTON_RADIUS,
			viewHeight: 2 * BUTTON_RADIUS,
			fillOpacity: 0.5,
			activeKeyboard: true
		})
	}

	setup() {
		super.setup()
		buttonDict[this.constructor.name] = this.constructor
		this.add(this.label)
		this.addDependency('midpoint', this.label, 'midpoint')
		this.updateModeIndex(0)
		this.update({
			fillColor: this.baseColor
		})
		this.label.update({
			viewWidth: 2 * this.radius,
			viewHeight: 2 * this.radius,
			text: this.text
		}, false)
		this.label.view.style['font-size'] = `${this.fontSize}px`
		this.label.view.style['color'] = Color.white().toHex()
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
			radius: this.radius * this.activeScalingFactor,
			fontSize: this.fontSize * this.activeScalingFactor,
			previousIndex: this.currentModeIndex
		})
		this.label.view.style.setProperty('font-size', `${this.fontSize}px`)
		this.label.update({
			viewWidth: 2 * this.radius,
			viewHeight: 2 * this.radius			
		})
		this.updateLabel()
	}
	
	onPointerDown(e: ScreenEvent) {
		e.preventDefault()
		e.stopPropagation()
		this.commonButtonDown()
		this.touchStart = eventVertex(e)
	}

	onPointerUp(e: ScreenEvent) {
		e.preventDefault()
		e.stopPropagation()
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
		let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		
		this.update({
			active: false,
			fillColor: this.colorForIndex(this.currentModeIndex),
			midpoint: newMidpoint,
			radius: this.radius / this.activeScalingFactor,
			fontSize: this.fontSize / this.activeScalingFactor
		})
		this.label.view.style.setProperty('font-size', `${this.fontSize}px`)
		this.label.update({
			viewWidth: 2 * this.radius,
			viewHeight: 2 * this.radius			
		})
		this.updateLabel()
		this.messagePaper(this.outgoingMessage)
	}
	
	messagePaper(message: object) {
		try {
			(window as Window).webkit.messageHandlers.handleMessageFromSidebar.postMessage(message)
		} catch {
			paper.getMessage(message)
		}
	}

	updateLabel() {
		if (this.label == undefined) { return }
		this.label.update({
			viewWidth: 2 * this.radius,
			viewHeight: 2 * this.radius
		})

		let f = this.active ? BUTTON_SCALE_FACTOR : 1
		let fs = f * (this.fontSize ?? 12)
		this.label.view?.setAttribute('font-size', fs.toString())
		if (this.showLabel) {
			try {
				let msg = this.messages[this.currentModeIndex]
				this.label.update({
					text: Object.values(msg)[0]
				})
			} catch { }
		} else {
			this.label.text = ''
		}
	}

	update(argsDict: object = {}, redraw: boolean = true) {
		argsDict['midpoint'] = buttonCenter(this.locationIndex)
		super.update(argsDict, false)
		this.updateLabel()
		if (redraw) { this.redraw() }
	}
	
	updateModeIndex(newIndex: number, withMessage: any = {}) {
		if (newIndex == this.currentModeIndex || newIndex == -1) { return }
		this.currentModeIndex = newIndex
		let message: object = this.messages[this.currentModeIndex]
		this.update({
			fillColor: this.colorForIndex(this.currentModeIndex)
		})
		if (withMessage as boolean) { this.messagePaper(message) }
 
		this.update()
	}
	
	selectNextOption() {
		if (this.currentModeIndex == this.messages.length - 1) { return }
		let dx: number = this.optionSpacing * (this.currentModeIndex + 1)

		//let c = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.update({
			radius: this.radius * this.activeScalingFactor,
			midpoint: this.midpoint.translatedBy(this.optionSpacing, 0)
		})
		this.updateModeIndex(this.currentModeIndex + 1, true)
	}
	
	
	selectPreviousOption() {
		if (this.currentModeIndex == 0) { return }
		let dx: number = this.optionSpacing * (this.currentModeIndex - 1)
		//this.midpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.update({
			radius: this.radius / this.activeScalingFactor,
			midpoint: this.midpoint.translatedBy(-this.optionSpacing, 0)
		})
		this.updateModeIndex(this.currentModeIndex - 1, true)
	}
	
	onPointerMove(e: ScreenEvent) {
		if (e != null) {
			e.preventDefault()
			e.stopPropagation()
		}
	
		let t: MouseEvent | Touch = null
		if (e instanceof MouseEvent) { t = e }
		else { t = e.changedTouches[0] }
	
		let p: Vertex = eventVertex(e)
		var dx: number = p.x - this.touchStart.x

		var newIndex: number = Math.floor(this.previousIndex + dx / this.optionSpacing)
		newIndex = Math.min(Math.max(newIndex, 0), this.messages.length - 1)
		dx += this.previousIndex * this.optionSpacing
		dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1))

		let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		
		this.updateModeIndex(newIndex, true)
		this.update({ midpoint: newMidpoint })
	}
	
}






























