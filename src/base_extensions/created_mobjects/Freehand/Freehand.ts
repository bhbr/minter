import { CreatingMobject } from 'core/mobject/creating/CreatingMobject'
import { Polygon } from 'core/mobject/svg/Polygon'
import { Circle } from 'base_extensions/mobjects/shapes/Circle'
import { Vertex } from 'core/helpers/Vertex'
import { Color } from 'core/helpers/Color'
import { ScreenEventHandler } from 'core/mobject/screen_events'

export class Freehand extends CreatingMobject {

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
			opacity: 1.0
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.addDependency('penStrokeColor', this.line, 'strokeColor')
		this.line.update({
			strokeColor: this.penStrokeColor
		})
		if (this.line.vertices.length > 0) {
			this.startPoint = this.line.vertices[0]
			this.endPoint = this.line.vertices[this.line.vertices.length - 1]
		}
		this.add(this.line)
	}

	
	updateFromTip(q: Vertex) {
		this.line.vertices.push(q)
		this.endPoint.copyFrom(q)
		this.redraw()
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