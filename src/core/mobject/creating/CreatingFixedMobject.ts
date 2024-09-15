import { Mobject } from '../Mobject'
import { CreatingMobject } from './CreatingMobject'
import { Color } from 'core/helpers/Color'
import { Vertex } from 'core/helpers/Vertex'
import { Rectangle } from 'base_extensions/mobjects/shapes/Rectangle'
import { LinkableMobject } from '../linkable/LinkableMobject'

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