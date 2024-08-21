import { CreativeButton } from './CreativeButton'
import { Color } from '../modules/helpers/Color'

export class CindyButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['cindy'],
			key: 't'
		})
	}

}

