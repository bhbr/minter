
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

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

