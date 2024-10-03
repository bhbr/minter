
import { SimpleButton } from 'extensions/mobjects/SimpleButton/SimpleButton'
import { Playable } from './Playable'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { CindyCanvas } from 'extensions/creations/CindyCanvas/CindyCanvas'

export class PlayButton extends SimpleButton {

	mobject: Playable

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'mobject'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			text: 'play',
			viewWidth: 40,
			viewHeight: 20,
			backgroundColor: Color.black(),
			color: Color.white(),
			borderColor: Color.white(),
			borderWidth: 1,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	action() {
		this.mobject.togglePlayState()
		this.toggleLabel()
	}

	toggleLabel() {
		this.update({
			text: (this.text == 'play') ? 'pause' : 'play'
		})
		
	}

}






















