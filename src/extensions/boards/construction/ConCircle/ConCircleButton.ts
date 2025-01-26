
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['circle']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}
