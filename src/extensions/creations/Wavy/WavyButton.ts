
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['wavy']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}

