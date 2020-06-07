import { pointerEventVertex, isTouchDevice, rgb, gray, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, LocatedEvent } from './modules/helpers'
import { Vertex, Translation } from './modules/transform'
import { Color, Mobject, MGroup, TextLabel } from './modules/mobject'
import { Circle } from './modules/shapes'
import { Segment } from './modules/arrows'
import { Paper } from './paper'

let paper: Paper = null
if (isTouchDevice === false) {
	const paperView = document.querySelector('#paper')
	paper = paperView['mobject'] as Paper
}

let sidebar: HTMLElement = document.querySelector('#sidebar')

let log: (string) => void = function(msg: string) { logInto(msg, 'sidebar-console') }

interface Window { webkit?: any }

function buttonCenter(index: number): Vertex {
	let y: number = buttonYOffset + index * (buttonSpacing + 2 * buttonRadius)
	return new Vertex(buttonXOffset, y)
}



const buttonXOffset: number = 50
const buttonYOffset: number = 50
const buttonSpacing: number = 12.5
const buttonRadius: number = 25
const buttonScaleFactor: number = 1.3

class SidebarButton extends Circle {
	
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
	boundButtonUpByPointer(e: LocatedEvent) { }
	boundButtonDownByPointer(e: LocatedEvent) { }
	boundCommonButtonUp() { }
	boundCommonButtonDown() { }
	boundButtonDrag(e: LocatedEvent) { }


	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			currentModeIndex: 0,
			previousIndex: 0,
			baseColor: Color.white(),
			strokeWidth: 0,
			locationIndex: 0,
			optionSpacing: 25,
			active: false,
			showLabel: true,
			text: 'text',
			fontSize: 12,
			messages: [],
			radius: buttonRadius
		})
		this.update(argsDict)

		this.updateModeIndex(0)
		this.label = new TextLabel({text: this.text})
		this.label.view.setAttribute('font-size', this.fontSize.toString())
		this.label.anchor = Vertex.origin()
		this.add(this.label)
		this.update()

		this.boundButtonUpByKey = this.buttonUpByKey.bind(this)
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
		this.boundButtonUpByPointer = this.buttonUpByPointer.bind(this)
		this.boundButtonDownByPointer = this.buttonDownByPointer.bind(this)
		this.boundCommonButtonUp = this.commonButtonUp.bind(this)
		this.boundCommonButtonDown = this.commonButtonDown.bind(this)
		this.boundButtonDrag = this.buttonDrag.bind(this)
		
		addPointerDown(this.view, this.boundButtonDownByPointer)
		document.addEventListener('keydown', this.boundButtonDownByKey)

		console.log(this.properties())
		console.log(this.fillColor)
		this.redraw()
	}

	numberOfIndices(): number { return this.messages.length }
	
	get baseColor(): Color { return this._baseColor }
	set baseColor(newColor: Color) {
		console.log('setting baseColor to', newColor.toCSS())
		this._baseColor = newColor
		this.fillColor = newColor
	}
	
	get locationIndex(): number { return this._locationIndex }
	set locationIndex(newIndex: number) {
		this._locationIndex = newIndex
		this.anchor = buttonCenter(this._locationIndex)
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
		this.active = true
		this.radius = buttonRadius * buttonScaleFactor
		this.previousIndex = this.currentModeIndex
		this.messagePaper(this.messages[0])
		this.update()
		this.redraw()
	}
	
	buttonDownByPointer(e: LocatedEvent) {
		e.preventDefault()
		e.stopPropagation()
		this.commonButtonDown()
		removePointerDown(this.view, this.boundButtonDownByPointer)
		addPointerUp(this.view, this.boundButtonUpByPointer)
		addPointerMove(this.view, this.boundButtonDrag)
		this.touchStart = pointerEventVertex(e)
	}

	buttonUpByPointer(e: LocatedEvent) {
		e.preventDefault()
		e.stopPropagation()
		removePointerUp(this.view, this.boundButtonUpByPointer)
		addPointerDown(this.view, this.boundButtonDownByPointer)
		removePointerMove(this.view, this.boundButtonDrag)
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
		this.radius = buttonRadius
		let dx: number = this.currentModeIndex * this.optionSpacing
		let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.midPoint.copyFrom(newMidpoint)

		this.active = false
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		this.update()
		this.redraw()
		this.label.view.setAttribute('font-size', this.fontSize.toString())
		this.messagePaper(this.outgoingMessage)
	}

	messagePaper(message: object) {
		try {
			(window as Window).webkit.messageHandlers.handleMessage.postMessage(message)
		} catch {
			paper.handleMessage(message)
		}
	}

	updateLabel() {
		if (this.label == undefined) { return }
		let f = this.active ? buttonScaleFactor : 1
		this.label.view.setAttribute('font-size', (f * this.fontSize).toString())
		if (this.showLabel) {
			try {
				let msg = this.messages[this.currentModeIndex]
				this.label.text = Object.values(msg)[0]
			} catch { }
		} else {
			this.label.text = ''
		}
	}

	update(argsDict: object = {}) {
		super.update(argsDict)
		this.updateLabel()
	}
	
	updateModeIndex(newIndex: number, withMessage: any = {}) {
		if (newIndex == this.currentModeIndex || newIndex == -1) { return }
		this.currentModeIndex = newIndex
		let message: object = this.messages[this.currentModeIndex]
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		if (withMessage as boolean) { this.messagePaper(message) }
 
		this.update()
		this.redraw()
		
	}
	
	selectNextOption() {
		if (this.currentModeIndex == this.messages.length - 1) { return }
		let dx: number = this.optionSpacing * (this.currentModeIndex + 1)
		this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.updateModeIndex(this.currentModeIndex + 1, true)
	}
	
	
	selectPreviousOption() {
		if (this.currentModeIndex == 0) { return }
		let dx: number = this.optionSpacing * (this.currentModeIndex - 1)
		this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.updateModeIndex(this.currentModeIndex - 1, true)
	}
	
	buttonDrag(e: LocatedEvent) {
		if (e != null) {
			e.preventDefault()
			e.stopPropagation()
		}
	
		let t: MouseEvent | Touch = null
		if (e instanceof MouseEvent) { t = e }
		else { t = e.changedTouches[0] }
	
		let p: Vertex = pointerEventVertex(e)
		var dx: number = p.x - this.touchStart.x

		var newIndex: number = Math.floor(this.previousIndex + dx / this.optionSpacing)
		newIndex = Math.min(Math.max(newIndex, 0), this.messages.length - 1)
		dx += this.previousIndex * this.optionSpacing
		dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1))

		let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
		this.update({ midPoint: newMidpoint })
		
		this.updateModeIndex(newIndex, true)
		this.redraw()

	}
	
}

class ColorChangeButton extends SidebarButton {

	palette: object
	colorNames: Array<string>

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes({
			optionSpacing: 15,
			showLabel: true,
			palette: {
				'white': Color.white(),
				'red': Color.red(),
				'orange': Color.orange(),
				'yellow': Color.yellow(),
				'green': Color.green(),
				'blue': Color.blue(),
				'indigo': Color.indigo(),
				'violet': Color.violet()
			}
		})
		this.setAttributes(argsDict)

		this.colorNames = Object.keys(this.palette)
		this.label.text = 'color'
		this.label.view.setAttribute('fill', 'black')

		for (let value of Object.values(this.palette)) {
			this.messages.push({color: value})
		}
		this.outgoingMessage = {}
		this.update()
		this.redraw()
	}

	colorForIndex(i): Color {
		return this.palette[this.colorNames[i]]
	}

	updateLabel() {
		if (this.label == undefined) { return }
		let f: number = this.active ? buttonScaleFactor : 1
		this.label.view.setAttribute('font-size', (f * this.fontSize).toString())
	}

	commonButtonUp() {
		this.radius = buttonRadius
		this.update()
		this.active = false
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		this.updateLabel()
		this.messagePaper(this.outgoingMessage)
		this.update()
		this.redraw()
	}

	buttonDrag(e) {
		super.buttonDrag(e)
		this.remove(this.label)
	}
}

class CreativeButton extends SidebarButton {

	creations: Array<string>

	constructor(argsDict: object = {}) {
		super()
		this.setAttributes(argsDict)
		this.creations = argsDict['creations']
		this.messages = []
		for (let creation of this.creations) {
			this.messages.push({creating: creation})
		}
		this.outgoingMessage = {creating: 'freehand'}
		this.update(argsDict)
		this.redraw()
	}

	commonButtonUp() {
		this.currentModeIndex = 0
		super.commonButtonUp()
	}

	updateLabel() {
		if (this.label == undefined) { return }
		if (this.showLabel) {
			try {
				this.text = this.creations[this.currentModeIndex]
				this.label.update({text: this.text})
				this.label.redraw()
			} catch { }
		} else {
			this.label.text = ''
		}

	}
}


class ToggleButton extends SidebarButton {

	commonButtonUp() {
		this.currentModeIndex = 0
		super.commonButtonUp()
	}

	updateLabel() {
		if (this.label == undefined) { return }
		let f: number = this.active ? buttonScaleFactor : 1
		this.label.view.setAttribute('font-size', (f * this.fontSize).toString())
	}

}

class DragButton extends ToggleButton {

	label2: TextLabel

	constructor(argsDict: object) {
		super(argsDict)
		this.label.text = '↕︎'
		this.setAttributes({ fontSize: 25 })
		this.label.view.setAttribute('font-family', 'Times')
		this.label2 = new TextLabel({text: this.text})
		this.label2.view.setAttribute('font-family', 'Times')
		this.label2.view.setAttribute('font-size', this.fontSize.toString())
		this.label2.view.setAttribute('transform', 'rotate(90, 51, 237.5)')
		this.label2.color = Color.white()
		this.label2.anchor = new Vertex(0, 2)
		this.add(this.label2)
		this.update()
		this.redraw()
	}

	updateLabel() {
		super.updateLabel()
		if (this.label2 == undefined) { return }
		let f: number = this.active ? buttonScaleFactor : 1
		this.label2.view.setAttribute('font-size', (f * this.fontSize).toString())
	}
}

class LinkButton extends ToggleButton {
	constructor(argsDict: object) {
		super(argsDict)
		this.label.text = 'link'
		this.update()
		this.redraw()
	}
}


let lineButton = new CreativeButton({
	creations: ['segment', 'ray', 'line'],
	key: 'q',
	baseColor: Color.gray(0.2),
	locationIndex: 0
})
sidebar.appendChild(lineButton.view)

let circleButton = new CreativeButton({
	creations: ['circle'],
	key: 'w',
	baseColor: Color.gray(0.4),
	locationIndex: 1
})
sidebar.appendChild(circleButton.view)

let sliderButton = new CreativeButton({
	creations: ['slider'],
	key: 'e',
	baseColor: Color.gray(0.6),
	locationIndex: 2
})
sidebar.appendChild(sliderButton.view)

let cindyButton = new CreativeButton({
	creations: ['cindy'],
	key: 'r',
	baseColor: Color.gray(0.2),
	locationIndex: 3
})
sidebar.appendChild(cindyButton.view)
  
let dragButton = new DragButton({
	messages: [{drag: true}],
	outgoingMessage: {drag: false},
	key: 't',
	baseColor: Color.gray(0.6),
	locationIndex: 4
})
dragButton.label.view.setAttribute('fill', 'black')
dragButton.label2.view.setAttribute('fill', 'black')
dragButton.redraw()
sidebar.appendChild(dragButton.view)

let linkButton = new LinkButton({
	messages: [{toggleLinks: true}],
	outgoingMessage: {toggleLinks: false},
	key: 'z',
	baseColor: Color.gray(0.2),
	locationIndex: 5
})
linkButton.label.view.setAttribute('fill', 'black')
linkButton.redraw()
sidebar.appendChild(linkButton.view)

let colorButton = new ColorChangeButton({
	key: 'a',
	baseColor: Color.white(),
	modeSpacing: 15,
	locationIndex: 6,
	fillOpacity: 1
})
sidebar.appendChild(colorButton.view)


let creating: boolean = false


