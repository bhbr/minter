
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

export class AlgebraButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['expression', 'equation'],
			iconSize: 35
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}