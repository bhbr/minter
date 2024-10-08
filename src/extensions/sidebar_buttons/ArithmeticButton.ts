
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ArithmeticButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['+', '–', '&times;', '/']
		})
	}

}