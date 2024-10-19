
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class NumberButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: ['input', 'slider', 'stepper']
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'never'
		})
	}
}