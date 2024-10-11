
import { CreativeButton } from './CreativeButton'

export class BoardButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			immutable: {
				creations: ['board']
			}
		})
	}

}