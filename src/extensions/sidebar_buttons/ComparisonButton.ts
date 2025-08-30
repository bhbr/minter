
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ComparisonButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['<', '≤', '>', '≥', '=', '≠'],
			baseFontSize: 24
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}