
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

export class ConButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['construction']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}