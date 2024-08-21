import { ScreenEventHandler, ScreenEvent } from '../mobject/screen_events'
import { Vertex } from '../helpers/Vertex'
import { Segment } from '../arrows/Segment'
import { CreatingMobject } from '../creations/CreatingMobject'
import { Mobject } from '../mobject/Mobject'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { Color } from '../helpers/Color'
import { Paper } from '../../Paper'
import { Rectangle } from '../shapes/Rectangle'
import { log } from '../helpers/helpers'

declare var CindyJS: any

export class CindyCanvas extends LinkableMobject {

	port: object
	id: string
	core: any
	points: Array<Array<number>>
	innerCanvas: Mobject
	
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			screenEventHandler: ScreenEventHandler.Self,
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			points: []
		})
	}

	statefulSetup() {
		super.statefulSetup()

		this.innerCanvas = new Mobject({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			screenEventHandler: ScreenEventHandler.Auto
		})
		this.add(this.innerCanvas)
		this.innerCanvas.view.style['pointer-events'] = 'auto'
		this.innerCanvas.view.id = this.id

		this.port = {
			id: this.id,
			width: this.viewWidth,
			height: this.viewHeight,
			transform: [{
				visibleRect: [0, 1, 1, 0]
			}]
		}
	}

	initCode() {
		return `resetclock();`
	}

	drawCode() {
		return `drawcmd();`
	}

	cindySetup() {
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

	setDragging(flag: boolean) {
		super.setDragging(flag)
		if (flag) {
			this.innerCanvas.screenEventHandler = ScreenEventHandler.Parent
		} else {
			this.innerCanvas.screenEventHandler = ScreenEventHandler.Auto
		}
	}

















}