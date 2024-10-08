
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
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