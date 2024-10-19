
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ArithmeticButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: ['+', '–', '&times;', '/']
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'never'
		})
	}
}