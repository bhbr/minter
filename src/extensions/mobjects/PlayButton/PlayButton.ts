
import { SimpleButton } from 'core/mobjects/SimpleButton'
import { Playable } from './Playable'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { CindyCanvas } from 'extensions/creations/CindyCanvas/CindyCanvas'
import { log } from 'core/functions/logging'

export class PlayButton extends SimpleButton {

	mobject: Playable

	defaults(): object {
		return {
			screenEventHandler: ScreenEventHandler.Self,
			mobject: undefined,
			text: 'play',
			frameWidth: 40,
			frameHeight: 20,
			backgroundColor: Color.black(),
			color: Color.white(),
			borderColor: Color.white(),
			borderWidth: 1
		}
	}

	mutabilities(): object {
		return {
			screenEventHandler: 'never'
		}
	}

	action() {
		this.mobject.togglePlayState()
		this.toggleLabel()
	}

	toggleLabel() {
		this.update({
			text: (this.text == 'play') ? 'stop' : 'play'
		})
		
	}

}






















