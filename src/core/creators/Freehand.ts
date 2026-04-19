
import { Creator } from 'core/creators/Creator'
import { PolygonalLine } from 'core/vmobjects/PolygonalLine'
import { vertex, vertexSubtract } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Transform } from 'core/classes/Transform'
import { log } from  'core/functions/logging'
import { deepCopy } from 'core/functions/copying'

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
		this.update({
			anchor: [0, 0]
		})
		this.line.update({
			anchor: [0, 0],
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
		let tl = this.line.ulCorner()
		this.update({
			anchor: tl
		})
		for (var i = 0; i < this.line.vertices.length; i++) {
			this.line.vertices[i][0] -= tl[0]
			this.line.vertices[i][1] -= tl[1]
		}
		this.line.view.redraw()
		let par = this.parent
		par.creator = null
		par.remove(this)
		if (this.view.visible) {
			par.addToContent(this)
		}
	}

}
























