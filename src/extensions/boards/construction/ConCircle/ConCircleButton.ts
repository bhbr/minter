
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['circle']
		})
	}
}
