
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ExtendedBoardButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['board', 'geo']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}