import { MGroup } from '../mobject/MGroup'
import { PointerEventPolicy } from '../mobject/pointer_events'
import { Vertex } from '../helpers/Vertex_Transform'
import { ExpandableMobject } from '../mobject/ExpandableMobject'
import { log } from '../helpers/helpers'

export class CreatedMobject extends MGroup {

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
			pointerEventPolicy: PointerEventPolicy.Handle,
			draggable: true,
			visible: true
		})
	}

	dissolveInto(mob: ExpandableMobject) {
		mob.remove(this)
		if (!this.visible) { return }
		for (let submob of this.children) {
			mob.add(submob)
			mob.addPannable(submob)
		}
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
	}

}