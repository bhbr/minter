import { pointerEventVertex, isTouchDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, LocatedEvent, PointerEventPolicy } from '../modules/mobject/pointer_events'
import { rgb, gray } from '../modules/helpers/rgb'
import { TAU } from '../modules/helpers/math'
import { Vertex, Transform } from '../modules/helpers/Vertex_Transform'
import { logInto } from '../modules/helpers/helpers'
import { Mobject } from '../modules/mobject/Mobject'
import { MGroup } from '../modules/mobject/MGroup'
import { TextLabel } from '../modules/TextLabel'
import { Color, COLOR_PALETTE } from '../modules/helpers/Color'
import { Circle } from '../modules/shapes/Circle'
import { Rectangle } from '../modules/shapes/Rectangle'
import { Segment } from '../modules/arrows/Segment'
import { buttonCenter, BUTTON_CENTER_X, BUTTON_CENTER_Y, BUTTON_SPACING, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry'
import { CreativeButton } from './CreativeButton'
import { DragButton } from './DragButton'
import { LinkButton } from './LinkButton'
import { ColorChangeButton } from './ColorChangeButton'

let log: (string) => void = function(msg: string) { logInto(msg, 'sidebar-console') }



export class Sidebar extends Mobject {

	background: Rectangle
	
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			viewWidth: 150,
			viewHeight: 1024,
			pointerEventVertex: PointerEventPolicy.Handle
		})
	}

	statelessSetup() {
		this.background = new Rectangle({
			fillColor: Color.black(),
			fillOpacity: 1,
			strokeWidth: 0,
			pointerEventPolicy: PointerEventPolicy.Pass
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

