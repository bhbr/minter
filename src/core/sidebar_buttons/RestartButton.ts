
import { SidebarButton } from './SidebarButton'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'

export class RestartButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.green(),
			baseFontSize: 36,
			messageKey: 'restart',
			messages: [],
			outgoingMessage: { restart: true }
		}
	}

	setup() {
		super.setup()
		this.label.update({
			text: '&circlearrowleft;'
		})
	}

	onPointerMove(e: ScreenEvent) { }

}