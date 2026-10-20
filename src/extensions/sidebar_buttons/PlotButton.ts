
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

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