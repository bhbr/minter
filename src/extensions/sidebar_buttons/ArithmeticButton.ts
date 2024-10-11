
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ArithmeticButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				creations: ['+', '–', '&times;', '/']
			}
		})
	}

}