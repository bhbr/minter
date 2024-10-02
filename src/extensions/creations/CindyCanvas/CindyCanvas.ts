
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Mobject } from 'core/mobjects/Mobject'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { Rectangle } from 'core/shapes/Rectangle'

declare var CindyJS: any

export class CindyCanvas extends Linkable implements Playable {

	port: object
	id: string
	core: any
	outerFrame: Rectangle
	innerCanvas: Mobject
	playButton: PlayButton
	playState: 'play' | 'pause' | 'stop'

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'port',
			'id',
			'core',
			'outerFrame',
			'innerCanvas',
			'playButton'
		])
	}
	
	defaults(): object {
		return Object.assign(super.defaults(), {
			screenEventHandler: ScreenEventHandler.Self,
			outerFrame: new Rectangle(),
			playButton: new PlayButton({
				anchor: new Vertex(5, 5)
			}),
			playedOnce: false,
			playState: 'stop',
			drawBorder: true,
			port: {
				transform: [{
					visibleRect: [0, 1, 1, 0]
				}]
			}
			/*
			core has no default because it is read-only and
			will be created in cindySetup as a CindyJS instance
			with state-dependent arguments
			*/
		})
	}

	setup() {
		super.setup()

		this.innerCanvas = new Mobject({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			screenEventHandler: ScreenEventHandler.Auto
		})
		this.add(this.innerCanvas)

		this.outerFrame.update({
			width: this.viewWidth,
			height: this.viewHeight,
			screenEventHandler: ScreenEventHandler.Below
		})
		this.add(this.outerFrame)

		this.innerCanvas.view.style['pointer-events'] = 'auto'

		this.update({
			id: `${this.constructor.name}-${Math.floor(1000 * Math.random())}`
		})
		this.innerCanvas.view.id = this.id

		Object.assign(this.port, {
			id: this.id,
			width: this.viewWidth,
			height: this.viewHeight,
			started: false
		})

		this.playButton.update({
			mobject: this
		})
		this.add(this.playButton)

		this.cindySetup()
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

		this.startCore()
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

	play() {
		if (!this.core.started) {
			this.core.startup()
			this.core.started = true
		}
		this.core.play()
		this.playState = 'play'
		this.outerFrame.update({
			screenEventHandler: ScreenEventHandler.Below
		})
	}

	pause() {
		this.core.pause()
		this.playState = 'pause'
		this.outerFrame.update({
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	togglePlayState() {
		if (this.playState == 'play') {
			this.pause()
		} else {
			this.play()
		}
	}

	stop() {
		this.core.stop()
		this.playState = 'stop'
		this.outerFrame.update({
			screenEventHandler: ScreenEventHandler.Self
		})
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

	startCore() {
		this.core = CindyJS.newInstance({
			scripts: `${this.id}*`,
			animation: { autoplay: false },
			ports: [this.port],
			geometry: this.geometry()
		})
	}

	reload(argsDict: object = {}) {
		let initScript = document.querySelector(`#${this.id}init`)
		initScript.textContent = this.initCode()
		let drawScript = document.querySelector(`#${this.id}draw`)
		drawScript.textContent = this.drawCode()
		let mousemoveScript = document.querySelector(`#${this.id}mousemove`)
		mousemoveScript.textContent = this.mousemoveCode()
		this.startCore()
	}

}























