
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['circle']
		})
	}
}
