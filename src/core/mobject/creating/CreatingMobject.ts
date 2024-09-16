import { Mobject } from '../Mobject'
import { ScreenEventHandler } from '../screen_events'
import { Vertex } from 'core/helpers/Vertex'
import { ExpandableMobject } from '../expandable/ExpandableMobject_Construction'

export class CreatingMobject extends Mobject {

	startPoint: Vertex
	endPoint: Vertex
	creation?: Mobject

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			startPoint: Vertex.origin(),
			endPoint: Vertex.origin(),
			creation: null
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
		this.creation = this.createMobject()
		this.creation.update({
			anchor: this.startPoint
		})
		this.parent.addToContent(this.creation)
		this.parent.remove(this)
	}

	createMobject(): Mobject {
		return new Mobject()
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
	}

}