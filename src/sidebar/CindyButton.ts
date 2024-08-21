import { CreativeButton } from './CreativeButton'

export class CindyButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['cindy'],
			key: 't'
		})
	}

}

