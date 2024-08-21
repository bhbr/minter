import { Point } from './Point'
import { ScreenEventHandler, ScreenEvent } from '../mobject/screen_events'
import { log } from '../helpers/helpers'

export class FreePoint extends Point {

	fixedArgs() {
		return Object.assign(super.fixedArgs(), {
			screenEventHandler: ScreenEventHandler.Self
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