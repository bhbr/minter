
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class StraitButton extends CreativeButton {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			readonly: {
				creations: ['line', 'segment', 'ray']
			}
		})
	}
}
