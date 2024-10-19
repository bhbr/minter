
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: ['circle']
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'never'
		})
	}
}
