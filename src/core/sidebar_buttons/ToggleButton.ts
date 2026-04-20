
import { SidebarButton } from './SidebarButton'
import { BUTTON_SCALE_FACTOR } from './button_geometry'
import { log, htmlLog } from 'core/functions/logging'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'

export class ToggleButton extends SidebarButton {

	messageKey: string
	locked: boolean
	lockColor: Color

	defaults(): object {
		return {
			baseColor: Color.gray(0.4),
			lockColor: Color.gray(0.7),
			locked: false,
			messageKey: 'toggle'
		}
	}

	setup() {
		super.setup()
		this.innerCircle.update({
			fillColor: this.baseColor
		})
		this.label.update({
			backgroundColor: this.innerCircle.fillColor
		})
	}

	setupMessages() {
		let message = {}
		message[this.messageKey] = true
		let outgoingMessage = {}
		outgoingMessage[this.messageKey] = false
		this.update({
			selectMessages: [message],
			deselectMessages: [outgoingMessage]
		})
	}

	baseMessageKey(): string {
		return this.messageKey
	}

	imageNameForIndex(index: number): string {
		return this.messageKey
	}

	commonButtonDown() {
		super.commonButtonDown()
		this.innerCircle.update({
			fillColor: this.lockColor
		})
	}

	commonMereButtonUp() {
		this.messagePaper(this.deselectMessages[0])
		this.touchStartTime = null
		this.sidebar.setActiveButton(null)
		this.innerCircle.update({
			fillColor: this.baseColor
		})
	}

	commonButtonTap() {
		if (this.sidebar.activeButton != this) { return }
		if (this.locked) {
			this.messagePaper(this.deselectMessages[0])
		} else {
			this.messagePaper(this.selectMessages[0])
		}
		this.touchStartTime = null
		this.locked = !this.locked
		this.innerCircle.update({
			fillColor: this.locked ? this.lockColor : this.baseColor
		})
	}

}




	


