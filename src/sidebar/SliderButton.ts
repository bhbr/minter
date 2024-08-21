import { CreativeButton } from './CreativeButton'

export class SliderButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['slider', 'value', '+', '–', '*', '/'],
			key: 'r'
		})
	}

}