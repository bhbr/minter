import { Mobject } from '../Mobject'
import { CreatingMobject } from './CreatingMobject'
import { Color } from 'core/helpers/Color'
import { Vertex } from 'core/helpers/Vertex'
import { Rectangle } from 'base_extensions/mobjects/shapes/Rectangle'
import { LinkableMobject } from '../linkable/LinkableMobject'

export class CreatingFixedMobject extends CreatingMobject {

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
		if (this.creation instanceof LinkableMobject) {
			this.creation.hideLinks()
		}
	}

	dissolve() {
		if (this.creation === null) { return }
		this.creation.update({
			anchor: this.endPoint
		})
		this.parent.addToContent(this.creation)
	}

}