
import { SidebarButton } from './SidebarButton'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { ImageView } from 'core/mobjects/ImageView'
import { log } from 'core/functions/logging'

export class EraseButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.red().brighten(0.7),
			messageKey: 'erase',
			selectMessages: [
				{ 'erase': true },
				{ 'restart': false }
			],
			deselectMessages: [
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