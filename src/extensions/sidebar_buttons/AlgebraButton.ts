
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class AlgebraButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['expr', 'exprs'],
			baseFontSize: 12,
			icon: new ImageView({
				imageLocation: '../../assets/expr.png',
				frameWidth: 35,
				frameHeight: 35
			})
		}
	}

	mutabilities(): object {
		return {
			creations: 'never'
		}
	}

}