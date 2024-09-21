
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ColorSampleButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['color']
		})
	}

}