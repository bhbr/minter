
import { Creator } from 'core/creators/Creator'
import { Polygon } from 'core/vmobjects/Polygon'
import { Circle } from 'core/shapes/Circle'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

export class Freehand extends Creator {

	line: Polygon
	penStrokeColor: Color
	penStrokeWidth: number
	penStrokeLength: number
	
	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0,
			penStrokeLength: 2.0,
			line: new Polygon({
				closed: false,
				opacity: 1.0
			})
		})
	}

	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			screenEventHandler: ScreenEventHandler.Below
		})
	}

	immutableProperties(): Array<string> {
		return super.immutableProperties().concat([
			'line'
		])
	}

	setup() {
		super.setup()
		this.line.update({
			vertices: this.creationStroke
		})
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
		this.add(this.line)
	}

	updateFromTip(q: Vertex, redraw: boolean = true) {
		super.updateFromTip(q, false)
		if (redraw) {
			this.line.redraw()
			this.redraw()
		}
	}

	dissolve() {
		this.line.adjustFrame()

		let dr = this.line.anchor.copy()
		this.line.update({
			anchor: Vertex.origin()
		})
		this.update({
			anchor: this.anchor.translatedBy(dr),
			viewWidth: this.line.getWidth(),
			viewHeight: this.line.getHeight()
		})

		let par = this.parent
		par.creator = null
		par.remove(this)
		if (this.visible) {
			par.addToContent(this)
		}
	}

}
























