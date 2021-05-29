import { Vertex } from './vertex-transform'
import { Color } from './color'
import { LinkableMobject } from './linkables'
import { Segment } from './arrows'
import { Rectangle, Circle } from './shapes'
import { CreatedMobject } from './creating'
import { Paper } from '../paper'

export class Pendulum extends LinkableMobject {

	length: number = 100
	mass: number = 1
	period: number = 1
	initialAngle: number
	initialSpeed: number = 0
	initialTime: number

	fixtureWidth: number = 50
	fixtureHeight: number = 10
	weightRadius: number = 10

	fixture: Rectangle
	string: Segment
	weight: Circle

	constructor(argsDict: object = {}) {

		super()
		this.fixture = new Rectangle({
			width: this.fixtureWidth,
			height: this.fixtureHeight,
			fillColor: Color.white(),
			fillOpacity: 1,
			anchor: new Vertex(-this.fixtureWidth/2, -this.fixtureHeight)
		})

		this.string = new Segment()
		this.weight = new Circle({
			radius: this.weightRadius,
			fillColor: Color.white(),
			fillOpacity: 1
		})
		this.add(this.fixture)
		this.add(this.string)
		this.add(this.weight)
		this.initialTime = Date.now()
		this.period = 500 * this.length ** 0.5 // ms

		this.outputNames = ['angle']

		this.update(argsDict)

	}

	angle() {
		let dt: number = (Date.now() - this.initialTime) % this.period
		return this.initialAngle * Math.cos(2 * Math.PI * dt/this.period)
	}

	update(argsDict: object = {}, redraw = true) {

		super.update(argsDict, redraw = false)
		if (this.fixture == undefined) { return }

		let angle: number = argsDict['initialAngle'] || this.angle()
		let newEndPoint: Vertex = (new Vertex(0, 1)).rotatedBy(angle).scaledBy(this.length)
		this.string.update({
			endPoint: newEndPoint
		}, redraw = redraw)
		this.weight.update({
			midPoint: newEndPoint
		}, redraw = redraw)
	}

	run() {
		window.setInterval(function(){this.update()}.bind(this), 10)
	}

}


export class CreatedPendulum extends CreatedMobject {

	pendulum: Pendulum

	constructor(argsDict: object = {}) {

		super()
		this.update(argsDict)
		this.pendulum = new Pendulum({
			anchor: this.startPoint
		})
		this.add(this.pendulum)
		this.update(argsDict)

	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		let dr: Vertex = q.subtract(this.startPoint)
		let length: number = dr.norm()
		let angle: number = Math.atan2(dr.x, dr.y)
		console.log(dr, angle)
		this.pendulum.update({
			length: length,
			initialAngle: angle
		})
	}

	dissolveInto(paper: Paper) {
		super.dissolveInto(paper)
		this.pendulum.update({
			initialTime: Date.now()
		})
		this.pendulum.run()
	}

}






















