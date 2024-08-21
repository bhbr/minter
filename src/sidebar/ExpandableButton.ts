import { CreativeButton } from './CreativeButton'
import { Color } from '../modules/helpers/Color'

export class ExpandableButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['exp', 'cons'],
			key: 'e'
		})
	}

}