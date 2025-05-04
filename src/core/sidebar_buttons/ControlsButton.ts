
import { ToggleButton } from './ToggleButton'

export class ControlsButton extends ToggleButton {

	defaults(): object {
		return {
			messageKey: 'ctrl'
		}
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}