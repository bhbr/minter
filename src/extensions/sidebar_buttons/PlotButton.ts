
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class PlotButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['plot', 'histogram'],
			iconSize: 28
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}