
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
	
	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			penStrokeColor: Color.white(),
			penStrokeWidth: 1.0
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			screenEventHandler: ScreenEventHandler.Below
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.line = new Polygon({
			closed: false,
			opacity: 1.0,
			vertices: this.creationStroke
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
		this.line.update({
			strokeColor: this.penStrokeColor
		})
		this.add(this.line)
	}

	
	updateFromTip(q: Vertex) {
		//this.line.vertices.push(q)
		//this.endPoint.copyFrom(q)
		super.updateFromTip(q)
		this.redraw() // necessary?
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
		this.parent.remove(this)
		if (this.visible) {
			par.addToContent(this)
		}
	}

}
























