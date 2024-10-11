
import { Mobject } from 'core/mobjects/Mobject'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export class SimpleButton extends TextLabel {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				screenEventHandler: ScreenEventHandler.Self
			},
			mutable: {
				viewWidth: 40,
				viewHeight: 20,
				backgroundColor: Color.black(),
				color: Color.white(),
				borderColor: Color.white(),
				borderWidth: 1
			}
		})
	}

	action() { } // reassigned on creation or overwritten in subclass

	onPointerUp(e: ScreenEvent) {
		this.action()
	}

}






















