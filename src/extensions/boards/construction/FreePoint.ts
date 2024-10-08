
import { ConPoint } from './ConPoint'
import { ScreenEventHandler, ScreenEvent } from 'core/mobjects/screen_events'

export class FreePoint extends ConPoint {

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'screenEventHandler'
		])
	}

	defaults() {
		return Object.assign(super.defaults(), {
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