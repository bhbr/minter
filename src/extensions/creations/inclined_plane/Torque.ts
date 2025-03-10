
import { vertex, vertexAdd, vertexSubtract, vertexOuterProduct } from 'core/functions/vertex'
import { Polygon } from 'core/vmobjects/Polygon'
import { ForceVector } from 'ForceVector'
import { Color } from 'core/classes/Color'

export class Torque extends Polygon {
	
	force: ForceVector

	get origin(): vertex {
		return this.view.frame.anchor
	}

	set origin(newValue: vertex) {
		this.view.frame.anchor = newValue
	}

	ownDefaults(): object {
		return {
			force: undefined,
			strokeWidth: 0,
			fillColor: new Color(0, 0.5, 0.5),
			fillOpacity: 0.5
		}
	}

	ownMutabilities(): object {
		return {
			force: 'on_init'
		}
	}

	lever(): vertex {
		return vertexSubtract(this.force.startPoint, this.origin)
	}

	size(): number {
		return vertexOuterProduct(this.lever(), this.force.mereVector())
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let r = this.lever()
		let F = this.force.asVectorOnScreen()
		if (Math.abs(this.size() * this.force.scale) < 5) { // in square pixels
			this.vertices = []
		} else {
			this.vertices = [
				[0, 0],
				r,
				vertexAdd(r, F),
				F
			]
		}
		if (redraw) { this.view.redraw() }
	}

}