
import { CreativeButton } from './CreativeButton'

export class BoardButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['board']
		})
	}

}