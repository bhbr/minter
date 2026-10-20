
import { ConPoint } from './ConPoint.js'
import { ScreenEventHandler, ScreenEvent } from 'mobjects/screen_events.js'

export class FreePoint extends ConPoint {

	defaults(): object {
		return {
			screenEventHandler: ScreenEventHandler.Parent
		}
	}

	mutabilities(): object {
		return {
			screenEventHandler: 'never'
		}
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