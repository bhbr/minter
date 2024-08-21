import { Mobject } from '../mobject/Mobject'
import { CreatingMobject } from './CreatingMobject'
import { Color } from '../helpers/Color'
import { Vertex } from '../helpers/Vertex'
import { Rectangle } from '../shapes/Rectangle'
import { log } from '../helpers/helpers'
import { LinkableMobject } from '../mobject/linkable/LinkableMobject'

export class CreatingFixedMobject extends CreatingMobject {

	creation: Mobject

	statefulSetup() {
		super.statefulSetup()
		this.creation = this.createdMobject()
		this.add(this.creation)
	}
	
	createdMobject(): Mobject {
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
		if (this.creation instanceof LinkableMobject) {
			this.creation.hideLinks()
		}
	}

	dissolve() {
		let cm = this.creation
		cm.update({
			anchor: this.endPoint
		})
		this.remove(cm)
		this.parent.addToContent(cm)
		this.parent.remove(this)
	}

}