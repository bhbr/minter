
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ColorSampleButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['color']
		})
	}

}