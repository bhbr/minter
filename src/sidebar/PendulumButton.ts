import { CreativeButton } from './CreativeButton'

export class PendulumButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['pendulum'],
			key: 'z'
		})
	}
	
}