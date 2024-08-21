import { CreativeButton } from './CreativeButton'

export class ArrowButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['segment', 'ray', 'line'],
			key: 'w'
		})
	}
}
