
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class StraitButton extends CreativeButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			creations: ['line', 'segment', 'ray']
		})
	}
}
