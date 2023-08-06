import { ToggleButton } from './ToggleButton'

export class LinkButton extends ToggleButton {

	statefulSetup() {
		super.statefulSetup()
		this.label.text = 'link'
	}

}