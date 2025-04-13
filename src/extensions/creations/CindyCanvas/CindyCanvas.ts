
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex } from 'core/functions/vertex'
import { Mobject } from 'core/mobjects/Mobject'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { Rectangle } from 'core/shapes/Rectangle'
import { getPaper } from 'core/functions/getters'

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
		return {
			port: {
				transform: [{
					visibleRect: [0, 1, 1, 0]
				}]
			},
			innerCanvas: new Mobject(),
			outerFrame: new Rectangle(),
			playButton: new PlayButton({
				anchor: [5, 5]
			}),

			id: undefined,

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
	}


	mutabilities(): object {
		return {
			port: 'never',
			innerCanvas: 'never',
			outerFrame: 'never',
			playButton: 'never',
			id: 'on_init'
		}
	}

	setup() {
		super.setup()

		if (!getPaper().loadedAPIs.includes('cindy')) {
			this.loadCindyAPI()
		}

		this.innerCanvas.view.frame.update({
			width: this.view.frame.width,
			height: this.view.frame.height
		})
		this.innerCanvas.update({
			screenEventHandler: ScreenEventHandler.Auto
		})
		this.innerCanvas.view.div.style['pointer-events'] = 'auto'
		this.innerCanvas.view.div.id = this.id
		this.add(this.innerCanvas)

		this.outerFrame.update({
			width: this.view.frame.width,
			height: this.view.frame.height,
			screenEventHandler: ScreenEventHandler.Parent
		})
		this.add(this.outerFrame)

		Object.assign(this.port, {
			id: this.id,
			width: this.view.frame.width,
			height: this.view.frame.height,
			started: false
		})

		this.add(this.playButton)
		this.playButton.update({
			mobject: this
		})
		this.createScripts()

		window.setTimeout(this.startCore.bind(this), 2000)
		// todo: async/await

		
	}

	loadCindyAPI() {
		let paper = getPaper()

		let scriptTag1 = document.createElement('script')
		scriptTag1.type = 'text/javascript'
		scriptTag1.src = '../../../CindyJS/build/js/Cindy.js'
		let scriptTag2 = document.createElement('script')
		scriptTag2.type = 'text/javascript'
		scriptTag2.src = '../../../CindyJS/build/js/CindyGL.js'
		document.head.append(scriptTag1)
		document.head.append(scriptTag2)

		paper.loadedAPIs.push('cindy')
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
			this.outerFrame.update({
				screenEventHandler: ScreenEventHandler.Parent
			})
		} else {
			this.outerFrame.update({
				screenEventHandler: ScreenEventHandler.Below
			})
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























