
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['wavy']
		})
	}

}

