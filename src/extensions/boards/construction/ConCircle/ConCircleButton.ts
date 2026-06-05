
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['circle']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}
