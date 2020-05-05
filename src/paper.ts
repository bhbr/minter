import { rgb } from './modules/helpers.js'

let log = function(msg: string) { } // logInto(msg.toString(), 'paper-console')

class Paper { //} extends LinkableMobject {

	children: Array<object>
	cindys: Array<object>
	visibleCreation: string
	cindyPorts: Array<object>
	snappablePoints: Array<object>
	colorPalette: object
	currentColor: string
	passAlongEvents: boolean

	constructor(argsDict: object) {
		//super(argsDict)
		this.children = []
		this.cindys = []
		this.setDragging(false)
		this.visibleCreation = 'freehand'
		this.cindyPorts = []
		this.snappablePoints = []

		this.colorPalette = {
			'black': rgb(0, 0, 0),
			'white': rgb(1, 1, 1),
			'red': rgb(1, 0, 0),
			'orange': rgb(1, 0.5, 0),
			'yellow': rgb(1, 1, 0),
			'green': rgb(0, 1, 0),
			'blue': rgb(0, 0, 1),
			'indigo': rgb(0.5, 0, 1),
			'violet': rgb(1, 0, 1)
		}
		this.currentColor = this.colorPalette['white']
	}

	setDragging(flag: boolean) {
		this.passAlongEvents = !flag
		// for (let c of this.cindys) {
		// 	c.draggable = flag
		// 	c.view.style['pointer-events'] = (flag ? 'none' : 'auto')
		// }
		// if (flag) {
		// 	this.selfHandlePointerDown = this.startDragging
		// 	this.selfHandlePointerMove = this.dragging
		// 	this.selfHandlePointerUp = this.endDragging
		// } else {
		// 	this.selfHandlePointerDown = this.startCreating
		// 	this.selfHandlePointerMove = this.creativeMove
		// 	this.selfHandlePointerUp = this.endCreating
		// }
	}


}

export const paper = new Paper({ view: document.querySelector('#paper'), passAlongEvents: true })









