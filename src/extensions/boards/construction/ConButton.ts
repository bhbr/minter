
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['geo']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}

}