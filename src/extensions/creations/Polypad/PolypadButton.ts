
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

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

