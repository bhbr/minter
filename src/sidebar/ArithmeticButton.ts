import { CreativeButton } from './CreativeButton'

export class ArithmeticButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['var', 'const', '+', '–', '&times;', '/'],
			key: 'r'
		})
	}

}