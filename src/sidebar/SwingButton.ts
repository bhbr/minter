import { CreativeButton } from './CreativeButton'

export class SwingButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['swing'],
			key: 'u'
		})
	}
	
}