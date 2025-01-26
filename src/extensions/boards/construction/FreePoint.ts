
import { ConPoint } from './ConPoint'
import { ScreenEventHandler, ScreenEvent } from 'core/mobjects/screen_events'

export class FreePoint extends ConPoint {

	ownDefaults(): object {
		return {
			screenEventHandler: ScreenEventHandler.Parent
		}
	}

	ownMutabilities(): object {
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