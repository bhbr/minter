
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ListOperationsButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['mean']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}