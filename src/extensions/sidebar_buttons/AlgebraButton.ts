
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class AlgebraButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['expression', 'expression-sheet'],
			baseFontSize: 12
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}