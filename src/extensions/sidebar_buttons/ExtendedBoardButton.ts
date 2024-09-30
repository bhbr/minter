
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ExtendedBoardButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['board', 'cons']
		})
	}

}