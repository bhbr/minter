
import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			messages: [{ link: true }],
			outgoingMessage: { link: false }
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.label.view['fill'] = 'black'
		this.label.text = 'link'
	}

}