
import { vertex, vertexArray, vertexSubtract, vertexNorm2 } from 'core/functions/vertex'
import { ConStrait } from '../ConStrait'

export class ConSegment extends ConStrait {

	vectorComponents(): vertex {
		return vertexSubtract(this.endPoint, this.startPoint)
	}

	norm2(): number { return vertexNorm2(this.vectorComponents()) }
	norm():number { return Math.sqrt(this.norm2()) }

}