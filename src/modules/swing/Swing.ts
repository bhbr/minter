import { Vertex } from '../helpers/Vertex'
import { Color } from '../helpers/Color'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'
import { Segment } from '../arrows/Segment'
import { Rectangle } from '../shapes/Rectangle'
import { Circle } from '../shapes/Circle'
import { CreatingMobject } from '../creations/CreatingMobject'
import { Paper } from '../../Paper'
import { log } from '../helpers/helpers'

export class Swing extends LinkableMobject {

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

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			fixtureWidth: 50,
			fixtureHeight: 20,
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
			anchor: new Vertex((this.viewWidth - this.fixtureWidth) / 2, 0)
		}, false)
		this.string.update({
			startPoint: new Vertex(this.viewWidth / 2, this.fixtureHeight)
		})
		this.weight.update({
			radius: this.weightRadius()
		})

	}


	angle(): number {
		let dt: number = (Date.now() - this.initialTime) % this.period()
		let value = this.initialAngle * Math.cos(2 * Math.PI * dt/this.period())
		return value
	}

	period(): number {
		return 500 * this.length ** 0.5 * 5 // ms
	}

	pixelLength(): number {
		return this.length * this.maxLength
	}

	weightRadius(): number {
		return 50 * this.mass ** 0.5
	}

	updateModel(argsDict: object = {}) {

		argsDict['viewHeight'] = this.fixtureHeight + this.pixelLength() + this.weightRadius()

		super.updateModel(argsDict)

		let angle: number = argsDict['initialAngle'] ?? this.angle()
		let newEndPoint: Vertex = (new Vertex(0, 1)).rotatedBy(- angle).scaledBy(this.pixelLength()).add(this.string.startPoint)

		this.string.updateModel({
			endPoint: newEndPoint
		})
		this.weight.updateModel({
			radius: this.weightRadius(),
			midpoint: newEndPoint
		})
	}

	run() {
		window.setInterval(function() { this.update() }.bind(this), 10)
	}

}




