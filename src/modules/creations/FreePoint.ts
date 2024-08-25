import { ConstructionPoint } from './ConstructionPoint'
import { ScreenEventHandler, ScreenEvent } from '../mobject/screen_events'
import { log } from '../helpers/helpers'

export class FreePoint extends ConstructionPoint {

	fixedArgs() {
		return Object.assign(super.fixedArgs(), {
			screenEventHandler: ScreenEventHandler.Parent
		})
	}

	onPointerDown(e: ScreenEvent) {
		this.startDragging(e)
	}

	onPointerMove(e: ScreenEvent) {
		this.dragging(e)
	}

	onPointerUp(e: ScreenEvent) {
		this.endDragging(e)
	}

}