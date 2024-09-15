import { Vertex } from 'core/helpers/Vertex'
import { ConSegment } from '../ConSegment/ConSegment'

export class ConRay extends ConSegment {

	drawingEndPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return this.startPoint.add(this.endPoint.subtract(this.startPoint).multiply(100))
	}

}