
import { CreativeButton } from './CreativeButton'

export class BoardButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['board']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}



}