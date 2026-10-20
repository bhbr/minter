
import { SimpleButton } from 'ui/SimpleButton.js'
import { Playable } from './Playable.js'
import { Color } from 'classes/Color.js'
import { ScreenEvent, ScreenEventHandler } from 'mobjects/screen_events.js'
import { CindyCanvas } from 'extensions/creations/CindyCanvas/CindyCanvas.js'
import { log } from 'functions/logging.js'

export class PlayButton extends SimpleButton {

	mobject: Playable

	defaults(): object {
		return {
			screenEventHandler: ScreenEventHandler.Self,
			mobject: null,
			text: 'play',
			frameWidth: 40,
			frameHeight: 20,
			backgroundColor: Color.black(),
			color: Color.white()
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






















