import { MGroup } from '../mobject/MGroup'
import { PointerEventPolicy } from '../mobject/pointer_events'
import { Vertex } from '../helpers/Vertex_Transform'
import { Paper } from '../../Paper'

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

	dissolveInto(paper: Paper) {
		paper.remove(this)
		if (!this.visible) { return }
		for (let submob of this.children) {
			paper.add(submob)
		}
	}

	updateFromTip(q: Vertex) {
		this.endPoint.copyFrom(q)
	}

}