
import { Polygon } from 'core/vmobjects/Polygon'
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Color } from 'core/classes/Color'

export class InclinedPlane extends Polygon {
	
	length: number
	inclination: number
	midpoint: Vertex

	defaults(): object {
		return {
			midpoint: Vertex.origin(),
			inclination: 0,
			fillColor: Color.white(),
			fillOpacity: 0.5,
			vertices: new VertexArray([
				Vertex.origin(),
				Vertex.origin(),
				Vertex.origin()
			])
		}
	}

	getWidth(): number {
		return this.length * Math.cos(this.inclination)
	}

	getHeight(): number {
		return this.length * Math.sin(this.inclination)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		let w = this.getWidth()
		let h = this.getHeight()
		this.vertices[0].copyFrom(this.midpoint.translatedBy(-w/2, h/2))
		this.vertices[1].copyFrom(this.midpoint.translatedBy(w/2, h/2))
		this.vertices[2].copyFrom(this.midpoint.translatedBy(w/2, -h/2))
	}

}