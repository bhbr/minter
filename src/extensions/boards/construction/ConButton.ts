
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['cons']
		})
	}

}