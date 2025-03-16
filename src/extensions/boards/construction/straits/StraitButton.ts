
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class StraitButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['line', 'segment', 'ray']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}
