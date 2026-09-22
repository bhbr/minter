
import { vertex, vertexOrigin } from 'core/functions/vertex'
import { Polygon } from 'core/vmobjects/Polygon'
import { Color } from 'core/classes/Color'

export class Line extends Polygon {

	startPoint: vertex
	endPoint: vertex

	defaults(): object {
		return {
			startPoint: vertexOrigin(),
			endPoint: vertexOrigin()
		}
	}

	get color(): Color { return this.strokeColor }
	set color(newValue: Color) { this.strokeColor = newValue }

	/*
	Subclasses might want to draw not right from start to end,
	but e. g. extend to the edge of the screen or leave
	space for an arrow
	*/
	drawingStartPoint() {
		return this.startPoint
	}

	drawingEndPoint() {
		return this.endPoint
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let p: vertex = this.drawingStartPoint()
		let q: vertex = this.drawingEndPoint()
		this.vertices = [p, q]
		if (redraw) { this.view.redraw() }
	}
}
