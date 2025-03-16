
import { SidebarButton } from './SidebarButton'
import { BUTTON_SCALE_FACTOR } from './button_geometry'

export class ToggleButton extends SidebarButton {

	defaults(): object {
		return {}
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