
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

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