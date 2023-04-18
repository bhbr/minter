import { Vertex } from './vertex-transform'
import { Color } from './color'
import { LinkableMobject } from './linkables'
import { Segment } from './arrows'
import { Rectangle, Circle } from './shapes'
import { CreatedMobject } from './creating'
import { Paper } from '../paper'

export class Pendulum extends LinkableMobject {

	length: number
	mass: number
	period: number
	initialAngle: number
	initialSpeed: number
	initialTime: number

	fixtureWidth: number
	fixtureHeight: number
	weightRadius: number

	fixture: Rectangle
	string: Segment
	weight: Circle


	statelessSetup() {
		super.statelessSetup()
		this.fixture = new Rectangle({
			fillColor: Color.white(),
			fillOpacity: 1
		})
		this.string = new Segment()
		this.weight = new Circle({
			fillColor: Color.white(),
			fillOpacity: 1
		})
		this.initialTime = Date.now()
		this.period = 500 * this.length ** 0.5 // ms
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.fixture)
		this.add(this.string)
		this.add(this.weight)
		this.fixture.update({
			width: this.fixtureWidth,
			height: this.fixtureHeight,
			anchor: new Vertex(-this.fixtureWidth/2, -this.fixtureHeight)
		}, false)

		this.weight.update({
			radius: this.weightRadius
		})

	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			fixtureWidth: 50,
			fixtureHeight: 10,
			weightRadius: 10,
			mass: 1,
			initialSpeed: 0,
			outputNames: ['angle']
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			length: 100,
			initialAngle: 0,
			initialTime: 0
		})
	}

	angle(): number {
		let dt: number = (Date.now() - this.initialTime) % this.period
		let value = this.initialAngle * Math.cos(2 * Math.PI * dt/this.period)
		return value
	}

	updateModel(argsDict: object = {}) {

		super.updateModel(argsDict)
		//if (this.fixture == undefined) { return }

		let angle: number = argsDict['initialAngle'] ?? this.angle()
		let newEndPoint: Vertex = (new Vertex(0, 1)).rotatedBy(-angle).scaledBy(this.length)
		
		this.string.updateModel({
			endPoint: newEndPoint
		})
		this.weight.updateModel({
			midpoint: newEndPoint
		})
	}

	run() {
		window.setInterval(function(){this.update()}.bind(this), 10)
	}

}


export class CreatedPendulum extends CreatedMobject {

	pendulum: Pendulum

	statelessSetup() {
		super.statelessSetup()
		this.pendulum = new Pendulum()
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.pendulum)
		this.pendulum.update({
			anchor: this.startPoint
		}, false)
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
			period: 500 * this.pendulum.length ** 0.5 // ms
		})
		this.pendulum.run()
	}

}






















