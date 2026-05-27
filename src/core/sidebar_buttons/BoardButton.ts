
import { CreativeButton } from './CreativeButton'

export class BoardButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['board']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}



}