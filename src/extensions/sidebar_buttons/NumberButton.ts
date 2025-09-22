
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class NumberButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['number', 'list', 'slider', 'stepper'],
			icon: new ImageView({
				imageLocation: '../../assets/number.png',
				frameWidth: 25,
				frameHeight: 25
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}