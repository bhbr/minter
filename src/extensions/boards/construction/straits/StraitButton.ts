
import { CreativeButton } from 'sidebar_buttons/CreativeButton.js'

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
