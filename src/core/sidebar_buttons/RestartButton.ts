
import { SidebarButton } from './SidebarButton'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { ImageView } from 'core/mobjects/ImageView'

export class RestartButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.green(),
			baseFontSize: 36,
			messageKey: 'clearStrokes',
			touchDownMessages: [
				{ 'clearStrokes': false },
				{ 'restart': false }
			],
			touchUpMessages: [
				{ clearStrokes: true },
				{ restart: true }
			],
			icon: new ImageView({
				imageLocation: '../../assets/clearStrokes.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}

	onPointerMove(e: ScreenEvent) { }

}