import { Vertex } from './vertex-transform'
import { Color } from './color'
import { LinkableMobject } from './linkables'
import { Segment } from './arrows'
import { Rectangle, Circle } from './shapes'
import { CreatedMobject } from './creating'
import { Paper } from '../paper'

export class Pendulum extends LinkableMobject {

	length = 100
	mass = 1
	period = 500 * this.length ** 0.5 // ms
	initialAngle = 0
	initialSpeed = 0
	initialTime = Date.now()
	readonly fixtureWidth = 50
	readonly fixtureHeight = 10
	readonly outputNames: Array<string> = ['angle']

	fixture = new Rectangle({
		width: this.fixtureWidth,
		height: this.fixtureHeight,
		anchor: new Vertex(-this.fixtureWidth/2, -this.fixtureHeight),
		fillColor: Color.white(),
		fillOpacity: 1
	})

	string = new Segment()
	weight = new Circle({
			fillColor: Color.white(),
			fillOpacity: 1,
			radius: 10
		})

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.fixture)
		this.add(this.string)
		this.add(this.weight)

	}

	angle() {
		let dt: number = (Date.now() - this.initialTime) % this.period
		return this.initialAngle * Math.cos(2 * Math.PI * dt/this.period)
	}

	updateSelf(args: object = {}) {

		super.updateSelf(args)

		let maybeAngle: any = args['initialAngle']
		var angle: number = 0
		if (typeof maybeAngle != 'number') { angle = this.angle() }
		else {
			angle = maybeAngle as number
			if (isNaN(angle)) { this.angle() }
		}
		let newEndPoint: Vertex = (new Vertex(0, 1)).rotatedBy(-angle).scaledBy(this.length)
		this.string.update({
			endPoint: newEndPoint
		}, false)
		this.weight.update({
			midpoint: newEndPoint
		}, false)
	}

	run() {
		window.setInterval(function(){this.update()}.bind(this), 10)
	}

}


export class CreatedPendulum extends CreatedMobject {

	pendulum = new Pendulum({
			anchor: this.startPoint
		})

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	setup() {
		super.setup()
		this.add(this.pendulum)
		// this.pendulum.update({
		// 	anchor: this.startPoint
		// }, false)
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		let dr: Vertex = q.subtract(this.startPoint)
		let length: number = dr.norm()
		let angle: number = Math.atan2(dr.x, dr.y)
		this.pendulum.update({
			length: length,
			initialAngle: angle
		})
	}

	dissolveInto(paper: Paper) {
		super.dissolveInto(paper)
		this.pendulum.update({
			initialTime: Date.now(),
		})
		this.pendulum.run()
	}

}






















