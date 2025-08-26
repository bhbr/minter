
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ArithmeticButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['+', '–', '&times;', '/', '<'],
			baseFontSize: 36
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}