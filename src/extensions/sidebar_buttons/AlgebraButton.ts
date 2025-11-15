
import { CreativeButton } from 'core/sidebar_buttons/CreativeButton'
import { ImageView } from 'core/mobjects/ImageView'

export class AlgebraButton extends CreativeButton {

	defaults(): object {
		return {
			creations: ['expression', 'expression list'],
			icon: new ImageView({
				imageLocation: '../../assets/expression.png',
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