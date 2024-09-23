
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Mobject } from 'core/mobjects/Mobject'
import { Linkable } from 'core/linkables/Linkable'
import { PlayButton }  from './PlayButton'

declare var CindyJS: any

export class CindyCanvas extends Linkable {

	port: object
	id: string
	core: any
	innerCanvas: Mobject
	playButton: PlayButton
	
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			playedOnce: false
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

		this.playButton = new PlayButton({
			anchor: new Vertex(5, 5),
			cindy: this
		})

		this.add(this.playButton)
	}

	initCode() {
		return `resetclock();`
	}

	drawCode() {
		return `drawcmd();`
	}

	mousemoveCode(): string {
		// do not redraw until I say so
		return ''
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

		let mousemoveScript = document.createElement('script')
		mousemoveScript.setAttribute('type', 'text/x-cindyscript')
		mousemoveScript.setAttribute('id', `${this.id}mousemove`)
		mousemoveScript.textContent = this.mousemoveCode()
		document.body.appendChild(mousemoveScript)

		let argsDict: object = {
			scripts: `${this.id}*`,
			animation: { autoplay: false },
			ports: [this.port],
			geometry: this.geometry()
		}
		this.core = CindyJS.newInstance(argsDict)
	}

	startUp() {
		if (document.readyState === 'complete') {
			this.play()
		} else {
			document.addEventListener('DOMContentLoaded', function(e: Event) { this.play(); }.bind(this))
		}
	}

	play() {
		if (!this.core.started) {
			this.core.startup()
			this.core.started = true
		}
		this.core.play()
	}

	pause() {
		this.core.pause()
	}

	stop() {
		this.core.stop()
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

	reload(argsDict: object = {}) {
		let initScript = document.querySelector(`#${this.id}init`)
		initScript.textContent = this.initCode()
		let drawScript = document.querySelector(`#${this.id}draw`)
		drawScript.textContent = this.drawCode()
		let mousemoveScript = document.querySelector(`#${this.id}mousemove`)
		mousemoveScript.textContent = this.mousemoveCode()
		let args: object = {
			scripts: `${this.id}*`,
			animation: { autoplay: false },
			ports: [this.port],
			geometry: this.geometry()
		}
		this.core = CindyJS.newInstance(args)
		this.startUp()
	}

}























