import { CreativeButton } from './CreativeButton'
import { Color } from '../modules/helpers/Color'

export class SliderButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['slider'],
			key: 'r'
		})
	}

}