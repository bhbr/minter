
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

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				port: {
					transform: [{
						visibleRect: [0, 1, 1, 0]
					}]
				},
				innerCanvas: new Mobject(),
				outerFrame: new Rectangle(),
				playButton: new PlayButton({
					anchor: new Vertex(5, 5)
				})
			},
			immutable: {
				id: undefined
			},
			mutable: {
				screenEventHandler: ScreenEventHandler.Self,
				playedOnce: false,
				playState: 'stop',
				drawBorder: true,
				core: null
				/*
				core has no default because it is read-only and
				will be created in cindySetup as a CindyJS instance
				with state-dependent arguments
				*/
			}
		})
	}
	
	setup() {
		super.setup()

		this.innerCanvas.update({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			screenEventHandler: ScreenEventHandler.Auto
		})
		this.add(this.innerCanvas)

		this.outerFrame.update({
			width: this.viewWidth,
			height: this.viewHeight,
			screenEventHandler: ScreenEventHandler.Parent
		})
		this.add(this.outerFrame)

		this.innerCanvas.view.style['pointer-events'] = 'auto'

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

		this.createScripts()
		this.startCore()
	}

	createScripts() {
		this.createInitScript()
		this.createDrawScript()
		this.createMouseMoveScript()
	}

	createInitScript() {
		let initScript = document.createElement('script')
		initScript.setAttribute('type', 'text/x-cindyscript')
		initScript.setAttribute('id', `${this.id}init`)
		initScript.textContent = this.initCode()
		document.body.appendChild(initScript)
	}

	createDrawScript() {
		let drawScript = document.createElement('script')
		drawScript.setAttribute('type', 'text/x-cindyscript')
		drawScript.setAttribute('id', `${this.id}draw`)
		drawScript.textContent = this.drawCode()
		document.body.appendChild(drawScript)
	}

	createMouseMoveScript() {
		let mouseMoveScript = document.createElement('script')
		mouseMoveScript.setAttribute('type', 'text/x-cindyscript')
		mouseMoveScript.setAttribute('id', `${this.id}mousemove`)
		mouseMoveScript.textContent = this.mouseMoveCode()
		document.body.appendChild(mouseMoveScript)
	}

	initCode() {
		return `resetclock();`
	}

	drawCode() {
		return `drawcmd();`
	}

	mouseMoveCode(): string {
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
			screenEventHandler: ScreenEventHandler.Parent
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
			this.outerFrame.screenEventHandler = ScreenEventHandler.Parent
		} else {
			this.outerFrame.screenEventHandler = ScreenEventHandler.Below
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

	reload(args: object = {}) {
		let initScript = document.querySelector(`#${this.id}init`)
		initScript.textContent = this.initCode()
		let drawScript = document.querySelector(`#${this.id}draw`)
		drawScript.textContent = this.drawCode()
		let mouseMoveScript = document.querySelector(`#${this.id}mousemove`)
		mouseMoveScript.textContent = this.mouseMoveCode()
		this.startCore()
	}

}























