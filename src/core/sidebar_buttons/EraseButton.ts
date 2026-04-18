
import { SidebarButton } from './SidebarButton'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { ImageView } from 'core/mobjects/ImageView'

export class EraseButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.red().brighten(0.7),
			messageKey: 'erase',
			touchDownMessages: [
				{ 'erase': true },
				{ 'restart': false }
			],
			touchUpMessages: [
				{ 'erase': false },
				{ 'restart': true }
			],
			iconSize: 30
		}
	}

	setup() {
		super.setup()
		this.innerCircle.update({
			fillColor: Color.red().brighten(0.5)
		})
		this.label.update({
			backgroundColor: this.innerCircle.fillColor
		})
	}


}