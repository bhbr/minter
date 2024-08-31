import { CreativeButton } from './CreativeButton'

export class ArithmeticButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['var1', 'var10', 'const', '+', '–', '&times;', '/'],
			key: 'r'
		})
	}

}