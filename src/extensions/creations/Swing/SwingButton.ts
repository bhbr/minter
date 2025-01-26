
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class SwingButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['swing']
		}
	}
	
	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}