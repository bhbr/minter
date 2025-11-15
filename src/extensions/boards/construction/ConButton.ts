
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

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