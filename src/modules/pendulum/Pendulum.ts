import { Vertex } from '../helpers/Vertex'
import { Color } from '../helpers/Color'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { Segment } from '../arrows/Segment'
import { Rectangle } from '../shapes/Rectangle'
import { Circle } from '../shapes/Circle'
import { CreatingMobject } from '../creations/CreatingMobject'
import { Paper } from '../../Paper'

export class Pendulum extends LinkableMobject {

	maxLength: number
	length: number
	mass: number
	initialAngle: number
	initialSpeed: number
	initialTime: number

	fixtureWidth: number
	fixtureHeight: number

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
			initialSpeed: 0,
			inputNames: ['length', 'mass'],
			outputNames: ['angle', 'period']
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			maxLength: 300,
			length: 1,
			mass: 0.2,
			initialAngle: 0,
			initialTime: 0
		})
	}

	get angle(): number {
		let dt: number = (Date.now() - this.initialTime) % this.period
		let value = this.initialAngle * Math.cos(2 * Math.PI * dt/this.period)
		return value
	}

	get period(): number {
		return 500 * this.length ** 0.5 * 5 // ms
	}

	get pixelLength(): number {
		return this.length * this.maxLength
	}

	get weightRadius(): number {
		return 50 * this.mass ** 0.5
	}

	updateModel(argsDict: object = {}) {

		super.updateModel(argsDict)

		let angle: number = argsDict['initialAngle'] ?? this.angle
		let newEndPoint: Vertex = (new Vertex(0, 1)).rotatedBy(-angle).scaledBy(this.pixelLength)
		
		this.string.updateModel({
			endPoint: newEndPoint
		})
		this.weight.updateModel({
			radius: this.weightRadius,
			midpoint: newEndPoint
		})
	}

	run() {
		window.setInterval(function(){this.update()}.bind(this), 10)
	}

}





