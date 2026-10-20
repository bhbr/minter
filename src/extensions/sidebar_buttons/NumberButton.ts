
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'
import { ImageView } from 'mobjects/ImageView.js'

export class NumberButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['number', 'slider', 'stepper'],
			iconSize: 25
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}