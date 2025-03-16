
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return {
			messages: [{ link: true }],
			outgoingMessage: { link: false },
			text: 'link'
		}
	}

	mutabilities(): object {
		return {
			messages: 'never',
			outgoingMessage: 'never',
			text: 'never'
		}
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}