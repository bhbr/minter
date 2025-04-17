
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class NumberButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['num', 'numlist', 'input', 'slider', 'stepper']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}