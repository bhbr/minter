import { pointerEventVertex, isTouchDevice, rgb, gray, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto, LocatedEvent } from './modules/helpers'
import { TAU } from './modules/math'
import { Vertex, Transform } from './modules/vertex-transform'
import { Mobject, MGroup } from './modules/mobject'
import { TextLabel } from './modules/textlabel'
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

	readonly viewWidth = 150
	readonly viewHeight = 1024
	readonly interactive = true
	
	background = new Rectangle({
			width: this.viewWidth,
			height: this.viewHeight,
			fillColor: Color.gray(0.15),
			fillOpacity: 1,
			strokeWidth: 0,
			passAlongEvents: true
		})

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.background)
	}

}

class SidebarButton extends Circle {
	
	currentModeIndex = 0
	previousIndex = 0
	_baseColor = Color.white()
	_locationIndex = 0
	readonly optionSpacing: number = 25
	readonly interactive = true
	readonly strokeWidth = 0
	touchStart?: Vertex = null
	active = false
	showLabel = true
	text = 'label'
	messages: Array<object> = []
	outgoingMessage = {}
	key?: string = null
	_radius = buttonRadius
	viewWidth = 2 * buttonRadius
	viewHeight = 2 * buttonRadius
	fillOpacity = 1

	label = new TextLabel({
		fontSize: 12,
		color: Color.white(),
		viewWidth: 2 * this.radius,
		viewHeight: 2 * this.radius,
		passAlongEvents: true
	})

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	boundButtonUpByKey(e: KeyboardEvent) { }
	boundButtonDownByKey(e: KeyboardEvent) { }


	setup() {
		super.setup()

		this.boundButtonUpByKey = this.buttonUpByKey.bind(this)
		this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
		
		document.addEventListener('keydown', this.boundButtonDownByKey)

		addPointerDown(this.view, this.boundPointerDown) // this.boundButtonDownByPointer)
		this.add(this.label)
		this.addDependency('midpoint', this.label, 'midpoint')
		this.updateModeIndex(0)
		this.label.update({
			text: this.text
		}, false)
		// let fontSize = this.fontSize ?? 12
		// this.label.view.style['font-size'] = `${fontSize}px`
		// this.label.view.style['color'] = Color.white().toHex()

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
		this.midpoint = buttonCenter(this._locationIndex)
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
		console.log('messaging paper with', this.messages[0])
		this.messagePaper(this.messages[0])
		this.active = true
		let t = new Transform({
			center: this.localCenter(),
			scale: 1.2
		})
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
			radius: buttonRadius,
			transform: Transform.identity(),
			midpoint: newMidpoint
		})
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
		// if (this.label == undefined) { return }
		// this.label.update({
		// 	viewWidth: 2 * this.radius,
		// 	viewHeight: 2 * this.radius
		// })

		// let f = this.active ? buttonScaleFactor : 1
		// let fs = f * (this.fontSize ?? 12)
		// this.label.view?.setAttribute('font-size', fs.toString())
		if (this.showLabel) {
			try { // remove this
				let msg = this.messages[this.currentModeIndex]
				this.label.text = Object.values(msg)[0]
			} catch { }
		} else {
			this.label.text = ''
		}
	}

	updateSelf(args = {} ,redraw = true) {
		super.updateSelf(args, redraw)
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

	colorNames: Array<string> = Object.keys(COLOR_PALETTE)
	readonly optionSpacing = 15
	readonly showLabel = false
	outgoingMessage = {}

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()

		//this.label.view.setAttribute('fill', 'black')

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
		//this.label.update({text: ''})
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

	creations: Array<string> = []
	outgoingMessage = {creating: 'freehand'}

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	commonButtonUp() {
		this.currentModeIndex = 0
		super.commonButtonUp()
	}

	updateSelf(args = {}, redraw = true) {
		super.updateSelf(args, redraw)
		this.messages = []
		for (let creation of this.creations) {
			this.messages.push({creating: creation})
		}
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

	// updateLabel() {
	// 	if (this.label == undefined) { return }
	// 	let f: number = this.active ? buttonScaleFactor : 1
	// 	this.label.view.setAttribute('font-size', (f * this.fontSize).toString())
	// }

}

class DragButton extends ToggleButton {


	setup() {
		super.setup()
		this.label.update({
			fontSize: 25,
			fontFamily: 'Times',
			text: '↕︎'
		})
		// this.label.view.style['font-family'] = 'Times'
		// this.label.view.style['font-size'] = `${this.fontSize}px`
		// this.label.text = '↕︎'
	}

}

class LinkButton extends ToggleButton {

	setup() {
		super.setup()
		this.label.update({
			text: 'link'
		})
	}
}

class PanButton extends ToggleButton {
	setup() {
		super.setup()
		this.label.update({
			text: 'pan'
		})
	}
}


let sidebar = new Sidebar({
	view: document.querySelector('#sidebar')
})

paper.view.style.left = sidebar.viewWidth.toString() + "px"
let creating: boolean = false


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

// let circleButton = new CreativeButton({
// 	creations: ['circle'],
// 	key: 'w',
// 	baseColor: Color.gray(0.4),
// 	locationIndex: 1
// })
// sidebar.add(circleButton)
// circleButton.update({
// 	midpoint: buttonCenter(1)
// })

// let sliderButton = new CreativeButton({
// 	creations: ['slider'],
// 	key: 'e',
// 	baseColor: Color.gray(0.6),
// 	locationIndex: 2
// })
// sidebar.add(sliderButton)
// sliderButton.update({
// 	midpoint: buttonCenter(2)
// })

// let cindyButton = new CreativeButton({
// 	creations: ['cindy'],
// 	key: 'r',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 3
// })
// sidebar.add(cindyButton)
// cindyButton.update({
// 	midpoint: buttonCenter(3)
// })
  
// let pendulumButton = new CreativeButton({
// 	creations: ['pendulum'],
// 	key: 't',
// 	baseColor: Color.gray(0.4),
// 	locationIndex: 4
// })
// sidebar.add(pendulumButton)
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
// sidebar.add(dragButton)
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
// sidebar.add(linkButton)
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
// sidebar.add(colorButton)
// colorButton.update({
// 	midpoint: buttonCenter(7)
// })



// let panButton = new PanButton({
// 	messages: [{pan: true}],
// 	outgoingMessage: {pan: false},
// 	key: 'f',
// 	baseColor: Color.gray(0.6),
// 	modeSpacing: 15,
// 	locationIndex: 8,
// 	fillOpacity: 1
// })
// sidebar.add(panButton)
// panButton.update({
// 	midpoint: buttonCenter(8)
// })













