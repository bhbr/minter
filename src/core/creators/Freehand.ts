
import { Creator } from 'core/creators/Creator'
import { PolygonalLine } from 'core/vmobjects/PolygonalLine'
import { vertex, vertexSubtract } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Transform } from 'core/classes/Transform'

export class Freehand extends Creator {

	line: PolygonalLine
	penStrokeColor: Color
	penStrokeWidth: number
	penStrokeLength: number
	
	defaults(): object {
		return {
			screenEventHandler: ScreenEventHandler.Below,
			line: new PolygonalLine({
				closed: false
			}),
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penStrokeLength: 2.0
		}
	}

	mutabilities(): object {
		return {
			screenEventHandler: 'never',
			line: 'never'
		}
	}

	setup() {
		super.setup()
		this.line.update({
			vertices: this.creationStroke
		})
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
		this.add(this.line)
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, false)
		if (redraw) {
			this.line.view.redraw()
			this.view.redraw()
		}
	}

	dissolve() {
		this.update({
			frameWidth: this.line.getWidth(),
			frameHeight: this.line.getHeight()
		})

		let oldAnchor = this.line.anchor
		let newAnchor = this.line.ulCorner()
		let shift = vertexSubtract(oldAnchor, newAnchor)
		let t = new Transform({ shift: shift })
		this.line.applyTransform(t)
		this.update({
			anchor: vertexSubtract(this.anchor, shift)
		})

		let par = this.parent
		par.creator = null
		par.remove(this)
		if (this.view.visible) {
			par.addToContent(this)
		}
	}

}
























