
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['wavy']
		})
	}

}

