
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['wavy']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}

