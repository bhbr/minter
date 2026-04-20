
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

	commonButtonTap() {
		if (this.sidebar.activeButton != this) { return }
		let dx = this.touchStartLocation[0] - this.baseRadius + this.sidebar.frameWidth
		let i = Math.round(dx / this.optionSpacing)
		this.highlightOption(i)
		if (i == 0) { // erase
			this.updateModeIndex(i, this.touchDownMessages[i])
		} else if (i == 1) { // restart
			this.updateModeIndex(i, this.touchUpMessages[i])
			this.sidebar.setActiveButton(null)
		}
		this.touchStartLocation = null
		this.touchStartTime = null
	}

	commonMereButtonUp() {
		// i. e. without a tap
		if (this.sidebar.activeButton != this) { return }
		if (this.touchStartLocation == null) { return }
		let dx = this.touchStartLocation[0] - this.baseRadius + this.sidebar.frameWidth
		let i = Math.round(dx / this.optionSpacing)
		if (i == 0) { // erase
			this.updateModeIndex(i, this.touchDownMessages[i])
		} else if (i == 1) { // restart
			this.updateModeIndex(i, this.touchUpMessages[i])
		}
		this.touchStartLocation = null
		this.touchStartTime = null
		this.sidebar.setActiveButton(null)
	}


}