
import { CreativeButton } from './CreativeButton'

export class BoardButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['board']
		})
	}

}