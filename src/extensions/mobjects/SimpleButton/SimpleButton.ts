
import { Mobject } from 'core/mobjects/Mobject'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export class SimpleButton extends TextLabel {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			viewWidth: 40,
			viewHeight: 20,
			backgroundColor: Color.black(),
			color: Color.white(),
			borderColor: Color.white(),
			borderWidth: 1,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	action() { } // reassigned on creation or overwritten in subclass

	onPointerUp(e: ScreenEvent) {
		this.action()
	}

}






















