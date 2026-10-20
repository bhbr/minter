
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

export class ExtendedBoardButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['board', 'geo']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}