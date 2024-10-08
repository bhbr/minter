
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['wavy']
		})
	}

}

