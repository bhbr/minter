
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class NumberButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['number', 'slider', 'stepper', 'list'],
			iconSize: 25
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}