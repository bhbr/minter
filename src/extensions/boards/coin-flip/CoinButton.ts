
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class CoinButton extends CreativeButton {
	
	defaults(): object {
		return {
			creations: ['coin', 'coinrow'],
			icon: new ImageView({
				imageLocation: '../../assets/coin.png',
				frameWidth: 40,
				frameHeight: 40
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}