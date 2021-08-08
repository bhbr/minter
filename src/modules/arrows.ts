import { Vertex } from './vertex-transform'
import { MGroup, Polygon } from './mobject'

export class Arrow extends Polygon {

	startPoint = Vertex.origin()
	endPoint = Vertex.origin()

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

}

export class Segment extends Arrow {

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setup()
			this.update(args)
		}
	}

	components(): Vertex {
		return this.endPoint.subtract(this.startPoint)
	}

	updateSelf(args: object = {}) {
		super.updateSelf(args)
		let p: Vertex = this.drawingStartPoint()
		let q: Vertex = this.drawingEndPoint()
		this.vertices = [p, q]

	}

	drawingStartPoint(): Vertex { return this.startPoint }
	drawingEndPoint(): Vertex { return this.endPoint }

	norm2(): number { return this.components().norm2() }
	norm():number { return Math.sqrt(this.norm2()) }

}

export class Ray extends Segment {

	drawingEndPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100))
	}

}

export class Line extends Ray {

	drawingStartPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.startPoint }
		return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100))
	}

}

