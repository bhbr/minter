
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ExtendedBoardButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['board', 'cons']
		})
	}

}