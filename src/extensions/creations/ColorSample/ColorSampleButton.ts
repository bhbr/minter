
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ColorSampleButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['color']
		})
	}

}