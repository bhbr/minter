import { Mobject } from '../mobject/Mobject'
import { MGroup } from '../mobject/MGroup'
import { ScreenEventHandler } from '../mobject/screen_events'
import { Vertex } from '../helpers/Vertex'
import { ExpandableMobject } from '../mobject/expandable/ExpandableMobject'
import { log } from '../helpers/helpers'

export class CreatingMobject extends Mobject {

	startPoint: Vertex
	endPoint: Vertex

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin()
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	get parent(): ExpandableMobject {
		return super.parent as ExpandableMobject
	}
	set parent(newValue: ExpandableMobject) {
		super.parent = newValue
	}

	dissolve() {
		let cm = this.createdMobject()
		cm.update({
			anchor: this.startPoint
		})
		this.parent.addToContent(cm)
		this.parent.remove(this)
	}

	createdMobject(): Mobject {
		return this
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
	}

}