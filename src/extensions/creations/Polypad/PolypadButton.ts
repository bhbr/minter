
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class PolypadButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['polypad']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}

