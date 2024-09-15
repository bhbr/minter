import { CreativeButton } from 'core/sidebar/buttons/CreativeButton'

export class ConCircleButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['circle'],
			key: 'e'
		})
	}
}
