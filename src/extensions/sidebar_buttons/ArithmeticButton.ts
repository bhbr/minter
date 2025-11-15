
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ArithmeticButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['add', 'subtract', 'multiply', 'divide'],
			icon: new ImageView({
				imageLocation: '../../assets/add.png',
				frameWidth: 20,
				frameHeight: 20
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}