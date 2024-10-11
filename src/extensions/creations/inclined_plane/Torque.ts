
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Polygon } from 'core/vmobjects/Polygon'
import { ForceVector } from 'ForceVector'
import { Color } from 'core/classes/Color'

export class Torque extends Polygon {
	
	force: ForceVector

	get origin(): Vertex {
		return this.anchor
	}

	set origin(newValue: Vertex) {
		this.anchor = newValue
	}

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			immutable: {
				force: undefined
			},
			mutable: {
				strokeWidth: 0,
				fillColor: new Color(0, 0.5, 0.5),
				fillOpacity: 0.5
			}
		})
	}

	lever(): Vertex {
		return this.force.startPoint.subtract(this.origin)
	}

	size(): number {
		return Vertex.outerProduct(this.lever(), this.force.mereVector())
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let r = this.lever()
		let F = this.force.asVectorOnScreen()
		if (Math.abs(this.size() * this.force.scale) < 5) { // in square pixels
			this.vertices = new VertexArray()
		} else {
			this.vertices = new VertexArray([
				Vertex.origin(),
				r,
				r.add(F),
				F
			])
		}
		if (redraw) { this.redraw() }
	}

}