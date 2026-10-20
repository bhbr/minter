
import { Line } from 'shapes/Line.js'
import { vertex, vertexArray } from '@bhbr/affr2'

export class ConStrait extends Line {

	drawingStartPoint(): vertex { return this.startPoint }
	drawingEndPoint(): vertex { return this.endPoint }

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		
		this.vertices[0] = this.drawingStartPoint()
		this.vertices[1] = this.drawingEndPoint()
		if (redraw) { this.view.redraw() }
	}

}