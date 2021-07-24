import { LinkableMobject } from './linkables'
import { Vertex } from './vertex-transform'
import { Segment } from './arrows'
import { CreatedMobject } from './creating'
import { Mobject } from './mobject'
import { Color } from './color'
import { Paper } from '../paper'
import { LocatedEvent } from './helpers'
import { Rectangle } from './shapes'

declare var CindyJS: any

export class CindyCanvas extends LinkableMobject {

	port: object
	id: string
	core: any
	points: Array<Array<number>>
	
	constructor(argsDict: object = {}) {
		super()

		this.draggable = true
		this.interactive = true
		this.passAlongEvents = true
		this.vetoOnStopPropagation = true
		this.view.style['pointer-events'] = 'auto'
		this.view.id = this.id

		this.port = {
			id: this.id,
			width: this.viewWidth,
			height: this.viewHeight,
			transform: [{
				visibleRect: [0, 1, 1, 0]
			}]
		}

		this.points = []

		if (this.constructor.name == "CindyCanvas") {
			this.update(argsDict)
		}

	}


	initCode() {
		return `resetclock();`
	}

	drawCode() {
		return `drawcmd();`
	}


	setup() {
		let initScript = document.createElement('script')
		initScript.setAttribute('type', 'text/x-cindyscript')
		initScript.setAttribute('id', `${this.id}init`)
		initScript.textContent = this.initCode()
		document.body.appendChild(initScript)

		let drawScript = document.createElement('script')
		drawScript.setAttribute('type', 'text/x-cindyscript')
		drawScript.setAttribute('id', `${this.id}draw`)
		drawScript.textContent = this.drawCode()
		document.body.appendChild(drawScript)

		//this.port['element'] = this.view

		let argsDict: object = {
			scripts: `${this.id}*`,
			animation: { autoplay: true },
			ports: [this.port],
			geometry: this.geometry()
		}
		this.core = CindyJS.newInstance(argsDict)
	}

	startUp() {
		if (document.readyState === 'complete') {
			this.startNow()
		} else {
			document.addEventListener('DOMContentLoaded', function(e: Event) { this.startNow(); }.bind(this))
		}
	}

	startNow() {
		this.core.startup()
		this.core.started = true
		this.core.play()
		setTimeout(function() { console.log('core:', this.core) }.bind(this), 1000)
	}

	geometry(): Array<any> { return [] }

	localXMin(): number { return 0 }
	localXMax(): number { return this.viewWidth }
	localYMin(): number { return 0 }
	localYMax(): number { return this.viewHeight }

	canvas(): HTMLCanvasElement {
		for (let child of this.view.children) {
			if (child instanceof HTMLCanvasElement) {
				return child
			}
		}
	}

	enableDragging() {
		super.enableDragging()
		this.vetoOnStopPropagation = false
	}

	disableDragging() {
		super.disableDragging()
		this.vetoOnStopPropagation = true
	}
}


export class WaveCindyCanvas extends CindyCanvas {

	wavelength: number
	frequency: number

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.setDefaults({
			wavelength: 1,
			frequency: 0
		})
		this.inputNames = ['wavelength', 'frequency']

		if (this.constructor.name == "CondyCanvas") {
			this.update(argsDict)
			this.setup()
		}
	}

	initCode(): string {
		let l = 0.1*(this.wavelength || 1)
		let f = 10*(this.frequency || 1)
		return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););` + super.initCode()
	}

	drawCode(): string {
		return `drawcmd();`
	}

	geometry(): Array<object> {
		let ret: Array<object> = []
		let i = 0
		for (let point of this.points) {
			ret.push({name: "A" + i, kind: "P", type: "Free", pos: point})
			i += 1
		}
		return ret
	}

	update(argsDict: object = {}, redraw = true) {
		if (this.core != undefined && this.points.length > 0) {
			let l: number = 0.1 * (this.wavelength || 1)
			let f: number = 10 * (this.frequency || 1)
			this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););`)
		}
		super.update(argsDict, redraw)
	}

}



export class DrawnRectangle extends CreatedMobject {
	
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex
	top: Segment
	bottom: Segment
	left: Segment
	right: Segment

	constructor(argsDict: object) {
		super()
		this.endPoint = this.endPoint || this.startPoint.copy()
		this.p1 = this.startPoint
		this.p2 = new Vertex(this.endPoint.x, this.startPoint.y)
		this.p3 = this.endPoint
		this.p4 = new Vertex(this.startPoint.x, this.endPoint.y)
		this.top = new Segment({startPoint: this.p1, endPoint: this.p2})
		this.bottom = new Segment({startPoint: this.p4, endPoint: this.p3})
		this.left = new Segment({startPoint: this.p1, endPoint: this.p4})
		this.right = new Segment({startPoint: this.p2, endPoint: this.p3})

		this.addDependency('p1', this.top, 'startPoint')
		this.addDependency('p2', this.top, 'endPoint')
		this.addDependency('p4', this.bottom, 'startPoint')
		this.addDependency('p3', this.bottom, 'endPoint')
		this.addDependency('p1', this.left, 'startPoint')
		this.addDependency('p4', this.left, 'endPoint')
		this.addDependency('p2', this.right, 'startPoint')
		this.addDependency('p3', this.right, 'endPoint')

		this.top.strokeColor = Color.white()
		this.bottom.strokeColor = Color.white()
		this.left.strokeColor = Color.white()
		this.right.strokeColor = Color.white()
		this.add(this.top)
		this.add(this.bottom)
		this.add(this.left)
		this.add(this.right)

		if (this.constructor.name == "DrawnRectangle") {
			this.update(argsDict)
		}
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
		this.p2.x = this.endPoint.x
		this.p2.y = this.startPoint.y
		this.p4.x = this.startPoint.x
		this.p4.y = this.endPoint.y
		this.update()
	}

	dissolveInto(parent: Mobject) {
		let w: number = Math.abs(this.p3.x - this.p1.x)
		let h: number = Math.abs(this.p3.y - this.p1.y)
		let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y))

		let cv = new WaveCindyCanvas({
			anchor: topLeft,
			viewWidth: w,
			viewHeight: h,
			points: [[0.4, 0.4], [0.3, 0.8]],
			id: `wave-${w}x${h}`
		})

		parent.add(cv)
		cv.startUp()
	}

	
}










