
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class PlotButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['plot', 'hist']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}
}