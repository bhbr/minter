
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

export class SwingButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['swing']
		}
	}
	
	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}