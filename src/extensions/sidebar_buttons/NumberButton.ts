
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class NumberButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['input', 'slider', 'stepper']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}