
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class PlotButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['plot', 'histogram'],
			icon: new ImageView({
				imageLocation: '../../assets/plot.png',
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