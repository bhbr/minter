
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['cons']
		})
	}

}