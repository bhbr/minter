import { CreativeButton } from './CreativeButton'

export class ExpandableButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['cons', 'exp'],
			key: 'e'
		})
	}

}