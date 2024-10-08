
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class SwingButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['swing']
		})
	}
	
}