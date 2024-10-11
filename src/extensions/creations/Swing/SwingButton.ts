
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class SwingButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				creations: ['swing']
			}
		})
	}
	
}