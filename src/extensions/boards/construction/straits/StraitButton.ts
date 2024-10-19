
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class StraitButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: ['line', 'segment', 'ray']
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'never'
		})
	}
}
