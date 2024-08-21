import { CreativeButton } from './CreativeButton'
import { Color } from '../modules/helpers/Color'

export class CircleButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['circle'],
			key: 'e'
		})
	}
}
