import { CreativeButton } from 'core/sidebar/buttons/CreativeButton'

export class WavyButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['wavy'],
			key: 'z'
		})
	}

}

