
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class StraitButton extends CreativeButton {

	ownDefaults(): object {
		return {
			creations: ['line', 'segment', 'ray']
		}
	}

	ownMutabilities(): object {
		return {
			creations: 'never'
		}
	}
}
