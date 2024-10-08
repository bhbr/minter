
import { CreativeButton } from './CreativeButton'

export class BoardButton extends CreativeButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			creations: ['board']
		})
	}

}