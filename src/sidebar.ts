import { pointerEventVertex, isTouchDevice, rgb, gray, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, LocatedEvent, PointerEventPolicy } from './modules/helpers'
import { TAU } from './modules/math'
import { Vertex, Transform } from './modules/vertex-transform'
import { Mobject, MGroup, TextLabel } from './modules/mobject'
import { Color, COLOR_PALETTE } from './modules/color'
import { Circle, Rectangle } from './modules/shapes'
import { Segment } from './modules/arrows'
import { Paper } from './paper'

var paper: Paper = null

if (isTouchDevice === false) {
	const paperView = document.querySelector('#paper')
	paper = paperView['mobject'] as Paper
}


let log: (string) => void = function(msg: string) { logInto(msg, 'sidebar-console') }

interface Window { webkit?: any }

function buttonCenter(index: number): Vertex {
	let y: number = buttonCenterX + index * (buttonSpacing + 2 * buttonRadius)
	return new Vertex(buttonCenterX, y)
}



const buttonCenterX: number = 50
const buttonCenterY: number = 50
const buttonSpacing: number = 12.5
const buttonRadius: number = 25
const buttonScaleFactor: number = 1.3

class Sidebar extends Mobject {

	background: Rectangle
	
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			viewWidth: 150,
			viewHeight: 1024,
			pointerEventVertex: PointerEventPolicy.HandleYourself
		})
	}

	statelessSetup() {
		this.background = new Rectangle({
			fillColor: Color.black(),
			fillOpacity: 1,
			strokeWidth: 0,
			pointerEventPolicy: PointerEventPolicy.PassDown
		})
		super.statelessSetup()
	}

	statefulSetup() {
		this.add(this.background)
		this.background.update({
			width: this.viewWidth,
			height: this.viewHeight
		})
		super.statefulSetup()

	}

}

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


	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			strokeWidth: 0,
			optionSpacing: 25,
			pointerEventPolicy: PointerEventPolicy.HandleYourself
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
			radius: buttonRadius,
			viewWidth: 2 * buttonRadius,
			viewHeight: 2 * buttonRadius,
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
		addPointerDown(this.view, this.boundPointerDown) // this.boundButtonDownByPointer)
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
		this.messagePaper(this.messages[0])
		this.active = true
		let c = this.localCenter()
		let t = new Transform({shift: c})
		t.rightComposeWith(new Transform({scale: 1.2}))
		t.rightComposeWith(new Transform({shift: c}).inverse())
		// I know this is ugly, transform anchor doesn't work properly
		this.update({
			transform: t,
			previousIndex: this.currentModeIndex
		})
	}
	
	selfHandlePointerDown(e: LocatedEvent) {
		e.preventDefault()
		e.stopPropagation()
		this.commonButtonDown()
		removePointerDown(this.view, this.boundPointerDown)
		addPointerUp(this.view, this.boundPointerUp)
		addPointerMove(this.view, this.boundPointerMove)
		this.touchStart = pointerEventVertex(e)
	}

	selfHandlePointerUp(e: LocatedEvent) {
		e.preventDefault()
		e.stopPropagation()
		removePointerUp(this.view, this.boundPointerUp)
		addPointerDown(this.view, this.boundPointerDown)
		removePointerMove(this.view, this.boundPointerMove)
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
		let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)

		this.active = false
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		this.update({
			//radius: buttonRadius,
			transform: new Transform({scale: 1.0, anchor: this.localCenter()}), // identity does not work, weirdly enough
			midpoint: newMidpoint
		})
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
		this.label.update({
			viewWidth: 2 * this.radius,
			viewHeight: 2 * this.radius
		})

		let f = this.active ? buttonScaleFactor : 1
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
	selfHandlePointerMove(e: LocatedEvent) {
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
		
		this.updateModeIndex(newIndex, true)
		this.update({ midpoint: newMidpoint })
	}
	
}

class ColorChangeButton extends SidebarButton {

	colorNames: Array<string>

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			optionSpacing: 15,
			showLabel: false
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			showLabel: true
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.outgoingMessage = {}
	}

	statefulSetup() {
		super.statefulSetup()

		this.colorNames = Object.keys(COLOR_PALETTE)
		this.label.view.setAttribute('fill', 'black')

		for (let name of this.colorNames) {
			this.messages.push({color: name})
		}
	}

	colorForIndex(i): Color {
		return COLOR_PALETTE[this.colorNames[i]]
	}

	commonButtonDown() {
		if (this.active) { return }
		this.active = true
		this.radius = buttonRadius * buttonScaleFactor
		this.previousIndex = this.currentModeIndex
		this.update()
	}

	commonButtonUp() {
		this.radius = buttonRadius
		this.update({}, false)
		this.active = false
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		this.updateLabel()
		this.label.update({text: ''})
		this.messagePaper(this.outgoingMessage)
		this.update()
	}

//	buttonDrag(e: LocatedEvent) {
	selfHandlePointerMove(e: LocatedEvent) {
//		super.buttonDrag(e)
		super.selfHandlePointerMove(e)
		this.remove(this.label)
	}
}


class CreativeButton extends SidebarButton {

	creations: Array<string>

	statelessSetup() {
		super.statelessSetup()
		this.messages = []
		this.outgoingMessage = {creating: 'freehand'}
	}

	statefulSetup() {
		super.statefulSetup()
		for (let creation of this.creations) {
			this.messages.push({creating: creation})
		}
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
			} catch { }
		} else {
			this.label.update({text: ''})
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

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			fontSize: 25
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.label.view.style['font-family'] = 'Times'
		this.label.view.style['font-size'] = `${this.fontSize}px`
		this.label.text = '↕︎'
	}

}

class LinkButton extends ToggleButton {

	statefulSetup() {
		super.statefulSetup()
		this.label.text = 'link'
	}

}


let sidebar = new Sidebar({
	view: document.querySelector('#sidebar')
})

//paper.view.style.left = sidebar.viewWidth.toString() + "px"



let lineButton = new CreativeButton({
	creations: ['segment', 'ray', 'line'],
	key: 'q',
	baseColor: Color.gray(0.2),
	locationIndex: 0
})
sidebar.add(lineButton)
lineButton.update({
	midpoint: buttonCenter(0)
})

let circleButton = new CreativeButton({
	creations: ['circle'],
	key: 'w',
	baseColor: Color.gray(0.4),
	locationIndex: 1
})
sidebar.add(circleButton)
circleButton.update({
	midpoint: buttonCenter(1)
})

let sliderButton = new CreativeButton({
	creations: ['slider'],
	key: 'e',
	baseColor: Color.gray(0.6),
	locationIndex: 2
})
sidebar.add(sliderButton)
sliderButton.update({
	midpoint: buttonCenter(2)
})

let cindyButton = new CreativeButton({
	creations: ['cindy'],
	key: 'r',
	baseColor: Color.gray(0.2),
	locationIndex: 3
})
sidebar.add(cindyButton)
cindyButton.update({
	midpoint: buttonCenter(3)
})
  
let pendulumButton = new CreativeButton({
	creations: ['pendulum'],
	key: 't',
	baseColor: Color.gray(0.4),
	locationIndex: 4
})
sidebar.add(pendulumButton)
pendulumButton.update({
	midpoint: buttonCenter(4)
})
  
let dragButton = new DragButton({
	messages: [{drag: true}],
	outgoingMessage: {drag: false},
	key: 'a',
	baseColor: Color.gray(0.6),
	locationIndex: 5
})
dragButton.label.view.setAttribute('fill', 'black')
sidebar.add(dragButton)
dragButton.update({
	midpoint: buttonCenter(5)
})

let linkButton = new LinkButton({
	messages: [{toggleLinks: true}],
	outgoingMessage: {toggleLinks: false},
	key: 's',
	baseColor: Color.gray(0.2),
	locationIndex: 6
})
sidebar.add(linkButton)
linkButton.update({
	midpoint: buttonCenter(6)
})

let colorButton = new ColorChangeButton({
	key: 'd',
	baseColor: Color.white(),
	modeSpacing: 15,
	locationIndex: 7,
	fillOpacity: 1
})
sidebar.add(colorButton)
colorButton.update({
	midpoint: buttonCenter(7)
})


let creating: boolean = false

