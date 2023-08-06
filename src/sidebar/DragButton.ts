import { ToggleButton } from './ToggleButton'

export class DragButton extends ToggleButton {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			fontSize: 25
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.label.view.style['font-family'] = 'Times'
		this.label.view.style['font-size'] = `${this.fontSize}px`
		this.label.text = '↕︎'
	}

}