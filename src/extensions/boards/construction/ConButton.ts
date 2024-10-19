
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: ['cons']
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'never'
		})
	}

}