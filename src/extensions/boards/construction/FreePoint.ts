
import { ConPoint } from './ConPoint'
import { ScreenEventHandler, ScreenEvent } from 'core/mobjects/screen_events'

export class FreePoint extends ConPoint {

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