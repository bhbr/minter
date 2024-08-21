import { Vertex } from './../helpers/Vertex'
import { Segment } from './Segment'

export class Ray extends Segment {

	drawingEndPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100))
	}

}