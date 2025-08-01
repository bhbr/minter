
import { Mobject } from 'core/mobjects/Mobject'
import { Creator } from './Creator'
import { Color } from 'core/classes/Color'
import { vertex, vertexSubtract } from 'core/functions/vertex'
import { Rectangle } from 'core/shapes/Rectangle'
import { VView } from 'core/vmobjects/VView'
import { log } from 'core/functions/logging'

export class DraggingCreator extends Creator {

	setup() {
		super.setup()
		this.creation = this.createMobject()
		this.creation.update({
			anchor: vertexSubtract(this.getEndPoint(), this.getStartPoint())
		})
		this.add(this.creation)
	}
	
	createMobject(): Mobject {
		return new Rectangle({
			width: 50,
			height: 50,
			view: new VView({
				fillColor: Color.red(),
				fillOpacity: 1.0
			})
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, false)
		this.creation.update({
			anchor: vertexSubtract(q, this.getStartPoint())
		}, redraw)
		if (redraw) { this.view.redraw() }
	}

	dissolve() {
		if (this.creation === null) { return }
		this.creation.update({
			anchor: this.getEndPoint()
		})
		this.remove(this.creation)
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

}






















