
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ExtendedBoardButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				creations: ['board', 'cons']
			}
		})
	}

}