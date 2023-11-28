import { Point } from './Point'
import { PointerEventPolicy, LocatedEvent } from '../mobject/pointer_events'

export class FreePoint extends Point {

	fixedArgs() {
		return Object.assign(super.fixedArgs(), {
			draggable: true,
			pointerEventPolicy: PointerEventPolicy.Handle
		})
	}

	onPointerDown(e: LocatedEvent) {
		this.startDragging(e)
	}

	onPointerMove(e: LocatedEvent) {
		this.dragging(e)
	}

	onPointerUp(e: LocatedEvent) {
		this.endDragging(e)
	}

}