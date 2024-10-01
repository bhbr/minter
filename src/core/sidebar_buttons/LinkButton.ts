
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	defaults(): object {
		return Object.assign(super.defaults(), {
			messages: [{ link: true }],
			outgoingMessage: { link: false },
			text: 'link'
		})
	}

	setup() {
		super.setup()
		this.label.view['fill'] = 'black'
	}

}