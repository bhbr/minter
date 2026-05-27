
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class ColorSampleButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['color wheel', 'rgb color'],
			icon: new ImageView({
				imageLocation: '../../assets/color_wheel.png',
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