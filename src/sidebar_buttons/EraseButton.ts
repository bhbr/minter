
import { SidebarButton } from './SidebarButton.js'
import { Color } from 'classes/Color.js'
import { ScreenEvent } from 'mobjects/screen_events.js'
import { ImageView } from 'mobjects/ImageView.js'
import { log } from 'functions/logging.js'

export class EraseButton extends SidebarButton {
	
	defaults(): object {
		return {
			baseColor: Color.red().darken(0.3),
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
			fillColor: Color.red().darken(0.5)
		})
		this.label.update({
			backgroundColor: this.innerCircle.fillColor
		})
	}

	commonButtonTap() {
		if (this.selectedIndex == 1) {
			this.commonMereButtonUp()
		}
	}

}