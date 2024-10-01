
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ArithmeticButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['+', '–', '&times;', '/']
		})
	}

}