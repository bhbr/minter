import { Point } from './Point'
import { PointerEventPolicy } from '../mobject/pointer_events'

export class FreePoint extends Point {

	fixedArgs() {
		return Object.assign(super.fixedArgs(), {
			draggable: true,
			pointerEventPolicy: PointerEventPolicy.Handle
		})
	}

}