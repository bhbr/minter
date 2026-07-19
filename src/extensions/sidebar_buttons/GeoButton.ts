
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class GeoButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['geo']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}