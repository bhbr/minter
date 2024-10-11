
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				creations: ['circle']
			}
		})
	}
}
