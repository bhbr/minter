
import { Mobject } from 'core/mobjects/Mobject'
import { Creator } from './Creator'
import { Color } from 'core/classes/Color'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Rectangle } from 'core/shapes/Rectangle'
import { Linkable } from 'core/linkables/Linkable'

export class DraggingCreator extends Creator {

	statefulSetup() {
		super.statefulSetup()
		this.creation = this.createMobject()
		this.add(this.creation)
	}
	
	createMobject(): Mobject {
		return new Rectangle({
			width: 50,
			height: 50,
			fillColor: Color.red(),
			fillOpacity: 1.0
		})
	}

	updateFromTip(q: Vertex) {
		super.updateFromTip(q)
		this.creation.update({
			anchor: q
		})
		// the following is a temporary bug fix
		if (this.creation instanceof Linkable) {
			this.creation.hideLinks()
		}
	}

	dissolve() {
		if (this.creation === null) { return }
		this.creation.update({
			anchor: this.getEndPoint()
		})
		this.parent.addToContent(this.creation)
	}

}






















