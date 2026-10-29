
import { CreativeButton } from './CreativeButton.js'

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