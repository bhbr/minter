
import { Creator } from 'core/creators/Creator'
import { PolygonalLine } from 'core/vmobjects/PolygonalLine'
import { Circle } from 'core/shapes/Circle'
import { vertex } from 'core/functions/vertex'
import { Color } from 'core/classes/Color'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

export class Freehand extends Creator {

	line: PolygonalLine
	penStrokeColor: Color
	penStrokeWidth: number
	penStrokeLength: number
	
	ownDefaults(): object {
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

	ownMutabilities(): object {
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

		let par = this.parent
		par.creator = null
		par.remove(this)
		if (this.view.visible) {
			par.addToContent(this)
		}
	}

}
























