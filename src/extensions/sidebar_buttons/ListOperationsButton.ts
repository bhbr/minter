
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class ListOperationsButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['sum', 'avg', 'cumsum', 'cumavg']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}