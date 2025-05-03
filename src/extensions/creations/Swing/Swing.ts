
import { vertex, vertexAdd, vertexCentrallyRotatedBy, vertexCentrallyScaledBy } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { Linkable } from 'core/linkables/Linkable'
import { Line } from 'core/shapes/Line'
import { Rectangle } from 'core/shapes/Rectangle'
import { Circle } from 'core/shapes/Circle'

export class Swing extends Linkable {

	maxLength: number
	length: number
	mass: number
	initialAngle: number
	initialSpeed: number
	initialTime: number

	fixtureWidth: number
	fixtureHeight: number

	fixture: Rectangle
	string: Line
	weight: Circle

	defaults(): object {
		return {
			fixtureWidth: 50,
			fixtureHeight: 20,
			fixture: new Rectangle({
				fillColor: Color.white(),
				fillOpacity: 1
			}),
			string: new Line(),
			weight: new Circle({
				fillColor: Color.white(),
				fillOpacity: 1
			}),
			maxLength: 300,
			length: 1,
			mass: 0.2,
			initialAngle: 0,
			initialSpeed: 0,
			initialTime: Date.now(),
			inputProperties: [
				{ name: 'length', type: 'number' },
				{ name: 'mass', type: 'number' }
			],
			outputProperties: [
				{ name: 'angle', type: 'number' },
				{ name: 'period', type: 'number' }
			],
		}
	}

	mutabilities(): object {
		return {
			fixtureWidth: 'never',
			fixtureHeight: 'never',
			fixture: 'never',
			string: 'never',
			weight: 'never'
		}
	}

	setup() {
		super.setup()
		this.add(this.fixture)
		this.add(this.string)
		this.add(this.weight)
		this.fixture.update({
			width: this.fixtureWidth,
			height: this.fixtureHeight,
			anchor: [(this.view.frame.width - this.fixtureWidth) / 2, 0]
		}, true)
		this.string.update({
			startPoint: [this.view.frame.width / 2, this.fixtureHeight]
		})
		this.weight.update({
			radius: this.weightRadius()
		})
		this.view.frame.height = this.fixtureHeight + this.pixelLength() + this.weightRadius()
		this.outputList.update()
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

	update(args: object = {}, redraw: boolean = true) {

		args['frameHeight'] = this.fixtureHeight + this.pixelLength() + this.weightRadius()
		if (args['frameHeight'] !== undefined) {
			this.outputList.update()
		}

		super.update(args, false)

		let angle: number = args['initialAngle'] ?? this.angle()
		let newEndPoint: vertex = vertexAdd(vertexCentrallyScaledBy(vertexCentrallyRotatedBy([0, 1], - angle), this.pixelLength()), this.string.startPoint)

		this.string.update({
			endPoint: newEndPoint
		}, redraw)
		this.weight.update({
			radius: this.weightRadius(),
			midpoint: newEndPoint
		}, redraw)

		if (redraw) { this.view.redraw() }
	}

	run() {
		window.setInterval(function() { this.update() }.bind(this), 10)
	}

}





