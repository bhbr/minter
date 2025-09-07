
import { SidebarButton } from './SidebarButton'
import { BUTTON_SCALE_FACTOR } from './button_geometry'
import { log, htmlLog } from 'core/functions/logging'
import { Color } from 'core/classes/Color'
import { ScreenEvent } from 'core/mobjects/screen_events'

export class ToggleButton extends SidebarButton {

	locked: boolean

	defaults(): object {
		return {
			messageKey: 'key',
			baseColor: Color.gray(0.8),
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
			touchDownMessages: [message, message], // 2nd entry for locking
			touchUpMessages: [outgoingMessage]
		})
	}

	commonButtonUp() {
		if (this.currentModeIndex == 1) {
			if (this.locked) {
				super.commonButtonUp()
			}
			this.locked = !this.locked
			this.view.transform.update({
				scale: 1
			})
			this.redraw()
		} else {
			super.commonButtonUp()
		}
	}

	updateLabel() {
		if (this.label == undefined) { return }
		let f: number = this.active ? BUTTON_SCALE_FACTOR : 1
		this.label.view.div.setAttribute('font-size', (f * this.baseFontSize).toString())
	}


	imageNameForIndex(index: number): string {
		return this.messageKey
	}

}