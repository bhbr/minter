
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
	
	onTouchDown(e: ScreenEvent) {
		this.onPointerDown(e)
	}

	onPenDown(e: ScreenEvent) {
		this.onPointerDown(e)
	}

	onMouseDown(e: ScreenEvent) {
		this.onPointerDown(e)
	}

	onTouchMove(e: ScreenEvent) {
		this.onPointerMove(e)
	}

	onPenMove(e: ScreenEvent) {
		this.onPointerMove(e)
	}

	onMouseMove(e: ScreenEvent) {
		this.onPointerMove(e)
	}

	onTouchUp(e: ScreenEvent) {
		this.onPointerUp(e)
	}

	onPenUp(e: ScreenEvent) {
		this.onPointerUp(e)
	}

	onMouseUp(e: ScreenEvent) {
		this.onPointerUp(e)
	}


}