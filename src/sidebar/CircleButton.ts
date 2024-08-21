import { CreativeButton } from './CreativeButton'

export class CircleButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['circle'],
			key: 'e'
		})
	}
}
