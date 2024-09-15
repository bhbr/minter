import { Vertex } from 'core/helpers/Vertex'
import { ConRay } from '../ConRay/ConRay'

export class ConLine extends ConRay {

	drawingStartPoint(): Vertex {
		if (this.startPoint == this.endPoint) { return this.startPoint }
		return this.endPoint.add(this.startPoint.subtract(this.endPoint).multiply(100))
	}

}