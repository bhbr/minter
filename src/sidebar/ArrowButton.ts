import { CreativeButton } from './CreativeButton'
import { Color } from '../modules/helpers/Color'

export class ArrowButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['segment', 'ray', 'line'],
			key: 'w'
		})
	}
}
