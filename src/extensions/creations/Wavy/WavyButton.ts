
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['wavy', 'desmos']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}

