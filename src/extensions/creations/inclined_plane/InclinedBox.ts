
import { Vertex } from 'core/classes/vertex/Vertex'
import { VertexArray } from 'core/classes/vertex/VertexArray'
import { Transform } from 'core/classes/vertex/Transform'
import { Polygon } from 'core/vmobjects/Polygon'
import { log } from 'core/functions/logging'
import { TAU } from 'core/constants'

export class InclinedBox extends Polygon {
	
	width: number
	height: number
	_rotationAngle: number

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			mutable: {
				rotationAngle: 0
			}
		})
	}

	get centerOfMass(): Vertex {
		return this.anchor
	}

	set centerOfMass(newValue: Vertex) {
		this.anchor = newValue
	}

	get rotationAngle(): number {
		return this._rotationAngle
	}

	set rotationAngle(newAngle: number) {
		this._rotationAngle = newAngle
		let t = new Transform({
			angle: newAngle
		})
		this.update({
			transform: t
		})
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		let w2 = this.width / 2
		let h2 = this.height / 2
		this.vertices = new VertexArray([
			[-w2, -h2], [-w2, h2], [w2, h2], [w2 ,-h2]
		])
		if (redraw) { this.redraw() }
	}

	topDirection(): number {
		return this.rotationAngle + TAU / 4
	}














}