
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class StraitButton extends CreativeButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: ['line', 'segment', 'ray']
		})
	}
}
