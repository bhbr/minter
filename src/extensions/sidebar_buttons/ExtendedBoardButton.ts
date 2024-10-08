
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ExtendedBoardButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['board', 'cons']
		})
	}

}