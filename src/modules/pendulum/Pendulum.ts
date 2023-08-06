import { Vertex } from '../helpers/Vertex_Transform'
import { Color } from '../helpers/Color'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { Segment } from '../arrows/Segment'
import { Rectangle } from '../shapes/Rectangle'
import { Circle } from '../shapes/Circle'
import { CreatedMobject } from '../creations/CreatedMobject'
import { Paper } from '../../Paper'

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





