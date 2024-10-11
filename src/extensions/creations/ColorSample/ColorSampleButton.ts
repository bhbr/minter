
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ColorSampleButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				creations: ['color']
			}
		})
	}

}