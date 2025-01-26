
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ArithmeticButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['+', '–', '&times;', '/']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}