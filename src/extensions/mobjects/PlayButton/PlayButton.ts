
import { SimpleButton } from 'extensions/mobjects/SimpleButton/SimpleButton'
import { Playable } from './Playable'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { CindyCanvas } from 'extensions/creations/CindyCanvas/CindyCanvas'

export class PlayButton extends SimpleButton {

	mobject: Playable

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			screenEventHandler: ScreenEventHandler.Self,
			mobject: undefined,
			text: 'play',
			viewWidth: 40,
			viewHeight: 20,
			backgroundColor: Color.black(),
			color: Color.white(),
			borderColor: Color.white(),
			borderWidth: 1
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			screenEventHandler: 'never',
			mobject: 'on_init'
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






















