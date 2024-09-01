import { CreativeButton } from './CreativeButton'

export class NumberButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['var1', 'var10', 'value', 'input'],
			key: 'r'
		})
	}

}