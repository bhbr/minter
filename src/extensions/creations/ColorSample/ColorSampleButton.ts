
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ColorSampleButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['color-wheel', 'color-rgba'],
			icon: new ImageView({
				imageLocation: '../../assets/color-wheel.png',
				frameWidth: 32,
				frameHeight: 32
			}),
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}