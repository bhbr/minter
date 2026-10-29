
import { Mobject } from 'minter/mobjects/Mobject.js'
import { Creator } from './Creator.js'
import { Color } from 'minter/views/Color.js'
import { vertex, vertexAdd, vertexSubtract } from '@bhbr/affr2'
import { Rectangle } from 'minter/shapes/Rectangle.js'
import { VView } from 'minter/vmobjects/VView.js'
import { log } from 'minter/functions/logging.js'

export class DraggingCreator extends Creator {

	setup() {
		super.setup()
		this.creation = this.createMobject()
		this.add(this.creation)
	}
	
	createMobject(): Mobject {
		return new Rectangle({
			width: 50,
			height: 50,
			view: new VView({
				fillColor: Color.red(),
				fillOpacity: 1.0
			}),
			anchor: this.pointOffset
		})
	}

	updateFromTip(q: vertex, redraw: boolean = true) {
		super.updateFromTip(q, false)
		this.creation.update({
			anchor: vertexAdd(vertexSubtract(q, this.getStartPoint()), this.pointOffset)
		}, redraw)
		if (redraw) { this.view.redraw() }
	}

	dissolve() {
		if (this.creation === null) { return }
		this.creation.update({
			anchor: vertexAdd(this.creation.anchor, this.anchor)
		})
		this.remove(this.creation)
		this.parent.addToContent(this.creation)
		this.parent.creator = null
		this.parent.remove(this)
	}

}






















