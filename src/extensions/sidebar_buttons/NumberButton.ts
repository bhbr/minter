
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class NumberButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['input', 'slider', 'stepper']
		})
	}

}