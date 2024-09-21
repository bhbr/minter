
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class SwingButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['swing']
		})
	}
	
}