
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

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
