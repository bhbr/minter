
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ExtendedBoardButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: ['board', 'cons']
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'never'
		})
	}
}