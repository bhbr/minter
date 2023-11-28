import { Circle } from '../modules/shapes/Circle'
import { Color } from '../modules/helpers/Color'
import { Vertex, Transform } from '../modules/helpers/Vertex_Transform'
import { PointerEventPolicy } from '../modules/mobject/pointer_events'
import { buttonCenter, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry'
import { TextLabel } from '../modules/TextLabel'
import { Paper } from '../Paper'
import { eventVertex, LocatedEvent, isTouchDevice, addPointerDown, addPointerMove, addPointerUp, removePointerDown, removePointerMove, removePointerUp } from '../modules/mobject/pointer_events'
import { log } from '../modules/helpers/helpers'

var paper: Paper = null

if (isTouchDevice === false) {
	const paperView = document.querySelector('#paper')
	paper = paperView['mobject'] as Paper
}

interface Window { webkit?: any }

export class SidebarButton extends Circle {
	
	currentModeIndex: number
	previousIndex: number
	_baseColor: Color
	_locationIndex: number
	optionSpacing: number
	touchStart: Vertex
	active: boolean
	showLabel: boolean
	text: string
	label: TextLabel
	fontSize: number
	messages: Array<object>
	outgoingMessage: object
	key: string

	boundButtonUpByKey(e: KeyboardEvent) { }
	boundButtonDownByKey(e: KeyboardEvent) { }


	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			strokeWidth: 0,
			optionSpacing: 25,
			pointerEventPolicy: PointerEventPolicy.Handle
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			currentModeIndex: 0,
			previousIndex: 0,
			baseColor: Color.white(),
			locationIndex: 0,
			active: false,
			showLabel: true,
			text: 'text',
			fontSize: 12,
			messages: [],
			radius: BUTTON_RADIUS,
			viewWidth: 2 * BUTTON_RADIUS,
			viewHeight: 2 * BUTTON_RADIUS,
			fillOpacity: 1
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.label = new TextLabel()

		this.boundButtonUpByKey = this.buttonUpByKey.bind(this)
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
		
		document.addEventListener('keydown', this.boundButtonDownByKey)

	}

	statefulSetup() {
		super.statefulSetup()
		//addPointerDown(this.view, this.boundRawOnPointerDown) // this.boundButtonDownByPointer)
		this.add(this.label)
		this.addDependency('midpoint', this.label, 'midpoint')
		this.updateModeIndex(0)
		this.label.update({
			viewWidth: 2 * this.radius,
			viewHeight: 2 * this.radius,
			text: this.text
		}, false)
		let fontSize = this.fontSize ?? 12
		this.label.view.style['font-size'] = `${fontSize}px`
		this.label.view.style['color'] = Color.white().toHex()
	}

	numberOfIndices(): number { return this.messages.length }
	
	get baseColor(): Color { return this._baseColor }
	set baseColor(newColor: Color) {
		this._baseColor = newColor
		this.fillColor = newColor
	}
	
	get locationIndex(): number { return this._locationIndex }
	set locationIndex(newIndex: number) {
		this._locationIndex = newIndex
		this.update({ midpoint: buttonCenter(this._locationIndex) })
	}

	colorForIndex(i: number): Color {
		return this.baseColor
	}
	
	buttonDownByKey(e: KeyboardEvent) {
		e.preventDefault()
		e.stopPropagation()
		document.addEventListener('keyup', this.boundButtonUpByKey)
		if (e.key == this.key) {
			this.commonButtonDown()
		} else if (e.key == 'ArrowRight' && this.active) {
			this.selectNextOption()
		} else if (e.key == 'ArrowLeft' && this.active) {
			this.selectPreviousOption()
		}
	}

	commonButtonDown() {
		if (this.active) { return }
		this.messagePaper(this.messages[0])
		this.active = true
		let c = this.localCenter()
		let t = new Transform({shift: c})
		t.rightComposeWith(new Transform({ scale: 1.2 }))
		t.rightComposeWith(new Transform({ shift: c }).inverse())
		// I know this is ugly, transform anchor doesn't work properly
		this.update({
			transform: t,
			previousIndex: this.currentModeIndex
		})
	}
	
	onPointerDown(e: LocatedEvent) {
		e.preventDefault()
		e.stopPropagation()
		this.commonButtonDown()
		//removePointerDown(this.view, this.boundRawOnPointerDown)
		//addPointerUp(this.view, this.boundRawOnPointerUp)
		//addPointerMove(this.view, this.boundRawOnPointerMove)
		this.touchStart = eventVertex(e)
	}

	onPointerUp(e: LocatedEvent) {
		e.preventDefault()
		e.stopPropagation()
		//removePointerUp(this.view, this.boundRawOnPointerUp)
		//addPointerDown(this.view, this.boundRawOnPointerDown)
		//removePointerMove(this.view, this.boundRawOnPointerMove)
		this.commonButtonUp()
	}
	
	buttonUpByKey(e: KeyboardEvent) {
		if (e.key == this.key) {
			document.removeEventListener('keyup', this.boundButtonUpByKey)
			document.addEventListener('keydown', this.boundButtonDownByKey)
			this.commonButtonUp()
		}
	}

	commonButtonUp() {
		let dx: number = this.currentModeIndex * this.optionSpacing
		let newAnchor = new Vertex(buttonCenter(this.locationIndex).x + dx - BUTTON_RADIUS, buttonCenter(this.locationIndex).y - BUTTON_RADIUS)

		this.active = false
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		this.update({
			//radius: buttonRadius,
			transform: new Transform({scale: 1.0, anchor: newAnchor}), // identity does not work, weirdly enough
			//midpoint: newMidpoint
		})
		this.label.view.setAttribute('font-size', this.fontSize.toString())
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
				this.label.text = Object.values(msg)[0]
			} catch { }
		} else {
			this.label.text = ''
		}
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.updateLabel()
	}
	
	updateModeIndex(newIndex: number, withMessage: any = {}) {
		if (newIndex == this.currentModeIndex || newIndex == -1) { return }
		this.currentModeIndex = newIndex
		let message: object = this.messages[this.currentModeIndex]
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		if (withMessage as boolean) { this.messagePaper(message) }
 
		this.update()
	}
	
	selectNextOption() {
		if (this.currentModeIndex == this.messages.length - 1) { return }
		let dx: number = this.optionSpacing * (this.currentModeIndex + 1)
		this.midpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.updateModeIndex(this.currentModeIndex + 1, true)
	}
	
	
	selectPreviousOption() {
		if (this.currentModeIndex == 0) { return }
		let dx: number = this.optionSpacing * (this.currentModeIndex - 1)
		this.midpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.updateModeIndex(this.currentModeIndex - 1, true)
	}
	
	//buttonDrag(e: LocatedEvent) {
	onPointerMove(e: LocatedEvent) {
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