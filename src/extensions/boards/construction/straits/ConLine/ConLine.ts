
import { vertex, vertexAdd, vertexSubtract, vertexMultiply } from 'core/functions/vertex'
import { ConStrait } from '../ConStrait'

export class ConLine extends ConStrait {

	drawingStartPoint(): vertex {
		if (this.startPoint == this.endPoint) { return this.startPoint }
		return vertexAdd(this.endPoint, vertexMultiply(vertexSubtract(this.startPoint, this.endPoint), 100))
	}

	drawingEndPoint(): vertex {
		if (this.startPoint == this.endPoint) { return this.endPoint }
		return vertexAdd(this.startPoint, vertexMultiply(vertexSubtract(this.endPoint, this.startPoint), 100))
	}

}