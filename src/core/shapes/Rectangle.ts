
import { vertex, vertexOrigin } from 'core/functions/vertex'
import { Polygon } from 'core/vmobjects/Polygon'

export class Rectangle extends Polygon {

	width: number
	height: number
	p1: vertex // top left is always (0, 0) (in its own frame)
	p2: vertex // = (width, 0)
	p3: vertex // = (width, height)
	p4: vertex // = (0, height)

	defaults(): object {
		return {
			width: 200,
			height: 100,
			p1: vertexOrigin(),
			p2: [200, 0],
			p3: [200, 100],
			p4: [0, 100]
		}
	}

	setup() {
		super.setup()
		this.update({
			vertices: [this.p1, this.p2, this.p3, this.p4]
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)

		//// internal dependencies
		this.view.frame.width = this.width
		this.view.frame.height = this.height

		this.p2[0] = this.width
		this.p3[0] = this.width
		this.p3[1] = this.height
		this.p4[1] = this.height

		if (redraw) { this.view.redraw() }
	}

}


























