
import { SidebarButton } from './SidebarButton'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { ImageView } from 'core/mobjects/ImageView'

export class EraseButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.red().brighten(0.5),
			messageKey: 'erase',
			touchDownMessages: [
				{ 'erase': true },
				{ 'restart': false }
			],
			touchUpMessages: [
				{ 'erase': false },
				{ 'restart': true }
			],
			icon: new ImageView({
				imageLocation: '../../assets/erase.png',
				frameWidth: 30,
				frameHeight: 30
			})
		}
	}


}