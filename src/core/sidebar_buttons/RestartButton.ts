
import { SidebarButton } from './SidebarButton'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { ImageView } from 'core/mobjects/ImageView'

export class RestartButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.red().brighten(0.5),
			messageKey: 'clear strokes',
			touchDownMessages: [
				{ 'clear strokes': false },
				{ 'restart': false }
			],
			touchUpMessages: [
				{ 'clear strokes': true },
				{ 'restart': true }
			],
			icon: new ImageView({
				imageLocation: '../../assets/clear_strokes.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}


}