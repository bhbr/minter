
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ColorSampleButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['rgb', 'wheel']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}