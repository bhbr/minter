import { Vertex } from '../helpers/Vertex'
import { VertexArray } from './../helpers/VertexArray'
import { Polygon } from './Polygon'

export class Rectangle extends Polygon {

	width: number
	height: number
	p1: Vertex
	p2: Vertex
	p3: Vertex
	p4: Vertex


	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			width: 100,
			height: 100,
			p1: Vertex.origin(),
			p2: Vertex.origin(),
			p3: Vertex.origin(),
			p4: Vertex.origin()
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.vertices = new VertexArray([this.p1, this.p2, this.p3, this.p4])
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		//// internal dependencies
		this.viewWidth = this.width
		this.viewHeight = this.height

		this.p2.x = this.width
		this.p3.x = this.width
		this.p3.y = this.height
		this.p4.y = this.height

	}

	
}