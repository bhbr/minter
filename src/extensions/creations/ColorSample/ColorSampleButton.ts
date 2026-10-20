
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

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