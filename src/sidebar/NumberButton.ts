import { CreativeButton } from './CreativeButton'

export class NumberButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['input', 'slider', 'stepper'],
			key: 'r'
		})
	}

}