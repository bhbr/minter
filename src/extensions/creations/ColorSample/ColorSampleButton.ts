
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ColorSampleButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['color']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}

}