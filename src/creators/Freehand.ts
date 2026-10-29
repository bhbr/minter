
import { Creator } from '../creators/Creator.js'
import { PolygonalLine } from '../vmobjects/PolygonalLine.js'
import { vertex, vertexSubtract } from '@bhbr/affr2'
import { Color } from '../views/Color.js'
import { ScreenEventHandler } from '../mobjects/screen_events.js'
import { Transform } from '@bhbr/affr2'
import { log } from  '../functions/logging.js'
import { Board } from '../boards/Board.js'

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
		let par = this.parent as Board
		if (par === null || par === undefined) { return }
		par.creator = null
		par.remove(this)
		if (this.view.visible) {
			par.addToContent(this)
			par.content.moveToBack(this)
		}
	}

}
























