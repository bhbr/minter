
import { InclinedBox } from './InclinedBox'
import { InclinedPlane } from './InclinedPlane'
import { Linkable } from 'core/linkables/Linkable'
import { DEGREES, TAU } from 'core/constants'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Transform } from 'core/classes/vertex/Transform'
import { log } from 'core/functions/logging'
import { ForceVector } from './ForceVector'
import { Torque } from './Torque'
import { Color } from 'core/classes/Color'
import { ScreenEventHandler, ScreenEvent } from 'core/mobjects/screen_events'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { Toggle } from 'extensions/mobjects/Toggle'
import { MGroup } from 'core/mobjects/MGroup'

const FORCE_SCALE: number = 50

export class InclinedScene extends Linkable implements Playable {

	inclination: number
	plane: InclinedPlane
	box: InclinedBox
	initialBoxPositionAlongPlane: number // 0 = bottom, 1 = top
	gravityForce: ForceVector
	normalForce: ForceVector
	staticFrictionForce: ForceVector
	forces: MGroup
	gravityTorque: Torque
	normalTorque: Torque
	staticFrictionTorque: Torque
	torques: MGroup
	torqueOrigin: Vertex
	forceScale: number
	staticFrictionNumber: number
	running: boolean
	simulationStartTime?: number
	simulationInterval?: number
	boxStartCOM: Vertex
	playButton: PlayButton
	playState: 'play' | 'pause' | 'stop'
	glidingStarted?: boolean
	_showTorques: boolean
	showTorquesToggle: Toggle

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'plane',
			'box',
			'initialBoxPositionAlongPlane',
			'forces',
			'torques',
			'forceScale',
			'boxStartCOM',
			'playButton',
			'showTorquesToggle'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			viewWidth: 500,
			viewHeight: 300,
			inclination: 20 * DEGREES,
			initialBoxPositionAlongPlane: 0.8,
			staticFrictionNumber: 0.5,
			running: false,
			simulationStartTime: null,
			simulationInterval: null,
			glidingStarted: null,
			showTorques: false,
			torqueOrigin: Vertex.origin(),
			inputNames: [
				'inclination'
			],
			forceScale: ForceVector,
			screenEventHandler: ScreenEventHandler.Self,
			playButton: new PlayButton(),
			box: new InclinedBox({
				width: 100,
				height: 75
			}),
			plane: new InclinedPlane({
				length: 500
			}),
			gravityForce: new ForceVector({
				direction: 3/4 * TAU,
				scale: FORCE_SCALE,
				size: 2,
				color: Color.red()
			}),
			normalForce: new ForceVector({
				scale: FORCE_SCALE,
				color: Color.blue()
			}),
			staticFrictionForce: new ForceVector({
				scale: FORCE_SCALE,
				color: Color.green()
			}),
			showTorquesToggle: new Toggle({
				propertyName: 'showTorques',
				labelText: 'show torques',
				anchor: new Vertex(10, 50)
			}),
			forces: new MGroup({ screenEventHandler: ScreenEventHandler.Below }),
			torques: new MGroup({ screenEventHandler: ScreenEventHandler.Below }),
		})
	}

	setup() {
		super.setup()
		this.playButton.update({ mobject: this })
		this.showTorquesToggle.update({ mobject: this })

		this.add(this.plane)
		this.add(this.box)
		this.add(this.forces)
		this.add(this.torques)
		this.add(this.playButton)
		this.add(this.showTorquesToggle)

		this.plane.update({
			midpoint: this.localCenter(),
			inclination: this.inclination
		})
		this.adjustFrame()

		this.box.addDependency('centerOfMass', this.gravityForce, 'startPoint')

		this.addDependency('inclination', this.plane, 'inclination')
		this.addDependency('inclination', this.box, 'rotationAngle')

		this.box.addDependency('bottomCenter', this.normalForce, 'startPoint')
		this.box.addDependency('topDirection', this.normalForce, 'direction')
		this.addDependency('gravityForceNormalComponent', this.normalForce, 'size')

		this.box.addDependency('bottomCenter', this.staticFrictionForce, 'startPoint')
		this.box.addDependency('rotationAngle', this.staticFrictionForce, 'direction')
		this.addDependency('staticFrictionForceSize', this.staticFrictionForce, 'size')

		this.update({
			inclination: this.inclination
		})

		this.forces.add(this.gravityForce)
		this.forces.add(this.normalForce)
		this.forces.add(this.staticFrictionForce)

		this.update({
			showTorques: false,
			torqueOrigin: this.box.llCorner()
		})

		this.gravityTorque = new Torque({
			anchor: this.torqueOrigin,
			force: this.gravityForce
		})
		this.torques.add(this.gravityTorque)

		this.normalTorque = new Torque({
			anchor: this.torqueOrigin,
			force: this.normalForce
		})
		this.torques.add(this.normalTorque)

		this.staticFrictionTorque = new Torque({
			anchor: this.torqueOrigin,
			force: this.staticFrictionForce
		})
		this.torques.add(this.staticFrictionTorque)

		this.add(this.torques)
		// this.showTorques = false
	}

	get showTorques(): boolean {
		return this._showTorques
	}

	set showTorques(newValue: boolean) {
		this._showTorques = newValue
		if (newValue) {
			this.torques.show()
		} else {
			this.torques.hide()
		}
	}

	gravityForceNormalComponent(): number {
		return this.gravityForce.size * Math.cos(this.inclination)
	}

	gravityForceParallelComponent(): number {
		return this.gravityForce.size * Math.sin(this.inclination)
	}

	hasStaticFriction(): boolean {
		return (this.gravityForceParallelComponent() < this.staticFrictionNumber * this.gravityForceNormalComponent())
	}

	staticFrictionForceSize(): number {
		return (this.hasStaticFriction() ? this.gravityForceParallelComponent() : 0)
	}

	vertexAlongPlane(relativePosition: number): Vertex {
		let bottomLeft = this.plane.llCorner()
		let topRight = this.plane.urCorner()
		return bottomLeft.add(topRight.subtract(bottomLeft).scaledBy(relativePosition))
	}

	update(argsDict: object = {}, redraw: boolean = true) {
		argsDict['torqueOrigin'] = this.box.llCorner()
		super.update(argsDict, false)
		let v = new Vertex(0, -this.box.height / 2).rotatedBy(this.inclination)
		let newCOM = this.vertexAlongPlane(this.initialBoxPositionAlongPlane).translatedBy(v)
		this.box.update({
			centerOfMass: newCOM
		})
		if (redraw) { this.redraw() }
	}

	play() {
		this.simulationStartTime = Date.now()
		this.boxStartCOM = this.box.centerOfMass.copy()
		this.glidingStarted = false
		this.simulationInterval = window.setInterval(
			this.run.bind(this), 100
		)
	}

	run() {
		if (this.hasStaticFriction()) {
			return
		}
		if (!this.glidingStarted) {
			this.simulationStartTime = Date.now()
		}
		this.glidingStarted = true
		let FtotSize = this.gravityForceParallelComponent() / 10
		let t = (Date.now() - this.simulationStartTime) / 1000
		let boxPositionAlongPlane = this.initialBoxPositionAlongPlane - FtotSize * 0.5 * t ** 2
		let newBoxBottomCenter = this.vertexAlongPlane(boxPositionAlongPlane)
		let v = new Vertex(0, -this.box.height / 2).rotatedBy(this.inclination)
		let newBoxCOM = newBoxBottomCenter.translatedBy(v)
		this.box.update({
			centerOfMass: newBoxCOM
		})
	}

	pause() {
		window.clearInterval(this.simulationInterval)
		this.simulationInterval = null
	}

	togglePlayState() {
		if (this.playState == 'play') {
			this.pause()
		} else {
			this.play()
		}
	}





}
