
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['cons']
		})
	}

}