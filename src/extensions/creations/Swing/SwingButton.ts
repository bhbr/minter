
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class SwingButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['swing']
		})
	}
	
}