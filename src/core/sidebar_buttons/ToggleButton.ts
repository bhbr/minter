
import { SidebarButton } from './SidebarButton'
import { BUTTON_SCALE_FACTOR } from './button_geometry'
import { log } from 'core/functions/logging'
import { Color } from 'core/classes/Color'

export class ToggleButton extends SidebarButton {

	defaults(): object {
		return {
			messageKey: 'key',
			baseColor: Color.gray(0.8)
		}
	}

	setup() {
		super.setup()
		let message = {}
		message[this.messageKey] = true
		let outgoingMessage = {}
		outgoingMessage[this.messageKey] = false
		this.update({
			messages: [message, message], // 2nd entry for locking
			outgoingMessage: outgoingMessage
		})
	}

	commonButtonUp() {
		this.currentModeIndex = 0
		super.commonButtonUp()
	}

	updateLabel() {
		if (this.label == undefined) { return }
		let f: number = this.active ? BUTTON_SCALE_FACTOR : 1
		this.label.view.div.setAttribute('font-size', (f * this.baseFontSize).toString())
	}

}