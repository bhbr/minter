
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

export class ComparisonButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['less than', 'less or equal', 'greater than', 'greater or equal', 'equal', 'not equal'],
			iconSize: 25,
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}