
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { CindyCanvas } from './CindyCanvas'

export class PlayButton extends TextLabel {

	playState: boolean
	cindy: CindyCanvas

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			playState: false,
			text: 'play'
		})
	}

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

	onPointerUp(e: ScreenEvent) {
		this.playState = !this.playState
		if (this.playState) {
			this.cindy.play()
			this.updateModel({
				text: 'pause'
			})
		} else {
			this.cindy.pause()
			this.updateModel({
				text: 'play'
			})

		}
	}

}





















