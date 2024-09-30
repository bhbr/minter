
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
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