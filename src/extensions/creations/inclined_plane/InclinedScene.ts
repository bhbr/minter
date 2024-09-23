
import { InclinedBox } from './InclinedBox'
import { InclinedPlane } from './InclinedPlane'
import { Linkable } from 'core/linkables/Linkable'
import { DEGREES, TAU } from 'core/constants'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Transform } from 'core/classes/vertex/Transform'
import { log } from 'core/functions/logging'
import { ForceVector } from './ForceVector'
import { Color } from 'core/classes/Color'
import { PlayButton } from './PlayButton'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

const FORCE_SCALE: number = 50

export class InclinedScene extends Linkable {

	inclination: number
	plane: InclinedPlane
	box: InclinedBox
	initialBoxPositionAlongPlane: number // 0 = bottom, 1 = top
	gravityForce: ForceVector
	normalForce: ForceVector
	staticFrictionForce: ForceVector
	forceScale: number
	staticFrictionNumber: number
	running: boolean
	simulationStartTime?: number
	simulationInterval?: number
	boxStartCOM: Vertex
	playButton: PlayButton
	glidingStarted?: boolean

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			viewWidth: 500,
			viewHeight: 300,
			inclination: 20 * DEGREES,
			initialBoxPositionAlongPlane: 0.8,
			staticFrictionNumber: 0.5,
			running: false,
			simulationStartTime: null,
			simulationInterval: null,
			glidingStarted: null
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			inputNames: [
				'inclination'
			],
			forceScale: ForceVector,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.playButton = new PlayButton({
			scene: this
		})
		this.box = new InclinedBox({
			width: 100,
			height: 75
		})
		this.plane = new InclinedPlane({
			length: 500
		})
		this.gravityForce = new ForceVector({
			direction: 3/4 * TAU,
			scale: FORCE_SCALE,
			size: 2,
			color: Color.red()
		})

		this.normalForce = new ForceVector({
			scale: FORCE_SCALE,
			color: Color.blue()
		})

		this.staticFrictionForce = new ForceVector({
			scale: FORCE_SCALE,
			color: Color.green()
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.plane)
		this.add(this.box)
		this.add(this.gravityForce)
		this.add(this.normalForce)
		this.add(this.staticFrictionForce)
		this.add(this.playButton)

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

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		let v = new Vertex(0, -this.box.height / 2).rotatedBy(this.inclination)
		let newCOM = this.vertexAlongPlane(this.initialBoxPositionAlongPlane).translatedBy(v)
		this.box.updateModel({
			centerOfMass: newCOM
		})
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
		console.log(FtotSize)
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







}
