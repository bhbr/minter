
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'

export class CoinButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['coin', 'coin row']
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}