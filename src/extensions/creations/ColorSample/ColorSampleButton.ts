
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ColorSampleButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['wheel', 'rgb'],
			icon: new ImageView({
				imageLocation: '../../assets/wheel.png',
				frameWidth: 32,
				frameHeight: 32
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}