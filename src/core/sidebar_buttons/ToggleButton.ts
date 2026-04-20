
import { SidebarButton } from './SidebarButton'
import { BUTTON_SCALE_FACTOR } from './button_geometry'
import { log, htmlLog } from 'core/functions/logging'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'

export class ToggleButton extends SidebarButton {

	locked: boolean
	lockColor: Color

	defaults(): object {
		return {
			messageKey: 'key',
			baseColor: Color.gray(0.4),
			lockColor: Color.gray(0.7),
			locked: false
		}
	}

	setup() {
		super.setup()
		let message = {}
		message[this.messageKey] = true
		let outgoingMessage = {}
		outgoingMessage[this.messageKey] = false
		this.update({
			touchDownMessages: [message],
			touchUpMessages: [outgoingMessage]
		})
		this.innerCircle.update({
			fillColor: this.baseColor
		})
		this.label.update({
			backgroundColor: this.innerCircle.fillColor
		})
	}

	commonButtonDown() {
		super.commonButtonDown()
		this.innerCircle.update({
			fillColor: this.lockColor
		})
	}

	commonMereButtonUp() {
		this.updateModeIndex(0, this.touchUpMessages[0])
		this.touchStartLocation = null
		this.touchStartTime = null
		this.sidebar.setActiveButton(null)
		this.innerCircle.update({
			fillColor: this.baseColor
		})
	}

	commonButtonTap() {
		if (this.sidebar.activeButton != this) { return }
		if (this.locked) {
			this.updateModeIndex(0, this.touchUpMessages[0])
		} else {
			this.updateModeIndex(0, this.touchDownMessages[0])
		}
		this.touchStartLocation = null
		this.touchStartTime = null
		this.locked = !this.locked
		this.innerCircle.update({
			fillColor: this.locked ? this.lockColor : this.baseColor
		})
	}

	imageNameForIndex(index: number): string {
		return this.messageKey
	}


	labelFromMessage(msg: object): string {
		if (this.currentModeIndex == 0) {
			return this.messageKey
		} else {
			return 'lock'
		}
	}

}